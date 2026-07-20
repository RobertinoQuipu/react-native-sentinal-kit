"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNativeModuleAvailable = void 0;
const platform_1 = require("./platform");
const ThreatScore_1 = require("./ThreatScore");
const simulation_1 = require("./simulation");
const LINKING_ERROR = `The native module 'SecurityKit' is not linked. ` +
    platform_1.Platform.select({ ios: "Did you run 'pod install'?", default: '' });
/**
 * The native module, if present. In this demo it is intentionally optional:
 * when it is missing we fall back to the JS simulation engine so the app
 * runs on any device/simulator without a custom native build.
 */
const NativeSecurityKit = platform_1.NativeModules.SecurityKit;
const isNativeModuleAvailable = () => NativeSecurityKit != null && typeof NativeSecurityKit.scan === 'function';
exports.isNativeModuleAvailable = isNativeModuleAvailable;
/**
 * SecurityKit is the single public entry point of the SDK.
 * It composes the per-domain reports and computes an aggregate risk score.
 */
class SecurityKitImpl {
    constructor() {
        this.activeProfile = simulation_1.SIMULATION_PROFILES[0];
        this.isRooted = () => this.field(r => r.device.rooted);
        this.isJailbroken = () => this.field(r => r.device.jailbroken);
        this.isEmulator = () => this.field(r => r.device.emulator || r.device.simulator);
        this.isDeveloperMode = () => this.field(r => r.device.developerMode);
        this.isUsbDebuggingEnabled = () => this.field(r => r.device.usbDebugging);
        this.isDebuggerAttached = () => this.field(r => r.runtime.debuggerAttached);
        this.isVpnEnabled = () => this.field(r => r.network.vpn);
        this.isProxyEnabled = () => this.field(r => r.network.proxy);
        this.isScreenCaptured = () => this.field(r => r.privacy.screenRecording);
    }
    /** Demo helper: pick which simulated device profile the scan reflects. */
    setSimulationProfile(index) {
        const clamped = Math.max(0, Math.min(simulation_1.SIMULATION_PROFILES.length - 1, index));
        this.activeProfile = simulation_1.SIMULATION_PROFILES[clamped];
    }
    getSimulationProfiles() {
        return simulation_1.SIMULATION_PROFILES;
    }
    get usingNativeModule() {
        return (0, exports.isNativeModuleAvailable)();
    }
    /**
     * Run a full security scan and return an aggregated report.
     */
    async scan() {
        if ((0, exports.isNativeModuleAvailable)()) {
            // Real native path: the module returns a fully-formed report.
            return NativeSecurityKit.scan();
        }
        // Simulated network latency so the UI can show a scanning state.
        await delay(650);
        const { device, runtime, network, integrity, privacy } = this.activeProfile;
        const partial = { device, runtime, network, integrity, privacy };
        const risk = ThreatScore_1.ThreatScore.calculate(partial);
        return { ...partial, risk };
    }
    async getRiskScore() {
        if (NativeSecurityKit &&
            typeof NativeSecurityKit.getRiskScore === 'function') {
            return NativeSecurityKit.getRiskScore();
        }
        return (await this.scan()).risk.score;
    }
    async field(selector) {
        return selector(await this.scan());
    }
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const isDev = typeof __DEV__ !== 'undefined'
    ? __DEV__
    : ((_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.NODE_ENV) !== 'production';
if (!(0, exports.isNativeModuleAvailable)() && isDev) {
    // eslint-disable-next-line no-console
    console.info(`[SecurityKit] ${LINKING_ERROR} Falling back to JS simulation engine.`);
}
const SecurityKit = new SecurityKitImpl();
exports.default = SecurityKit;
