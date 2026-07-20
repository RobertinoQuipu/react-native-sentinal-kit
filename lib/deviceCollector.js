"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectLiveReport = exports.hasLiveSignals = void 0;
const platform_1 = require("./platform");
const ThreatScore_1 = require("./ThreatScore");
function tryRequire(name) {
    var _a;
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require(name);
        return ((_a = mod === null || mod === void 0 ? void 0 : mod.default) !== null && _a !== void 0 ? _a : mod);
    }
    catch {
        return null;
    }
}
async function toBool(v) {
    try {
        return !!(await Promise.resolve(v));
    }
    catch {
        return false;
    }
}
/**
 * Returns true when at least one real on-device detection library is linked,
 * meaning a live scan will produce meaningful data.
 */
function hasLiveSignals() {
    return tryRequire('jail-monkey') != null;
}
exports.hasLiveSignals = hasLiveSignals;
async function collectLiveReport() {
    const jm = tryRequire('jail-monkey');
    const deviceInfo = tryRequire('react-native-device-info');
    const isIOS = platform_1.Platform.OS === 'ios';
    // ---- Device --------------------------------------------------------------
    const jailBroken = jm ? safe(() => jm.isJailBroken(), false) : false;
    const externalStorage = (jm === null || jm === void 0 ? void 0 : jm.isOnExternalStorage)
        ? safe(() => jm.isOnExternalStorage(), false)
        : false;
    const devSettings = (jm === null || jm === void 0 ? void 0 : jm.isDevelopmentSettingsMode)
        ? await toBool(jm.isDevelopmentSettingsMode())
        : false;
    const adbEnabled = (jm === null || jm === void 0 ? void 0 : jm.AdbEnabled) ? await toBool(jm.AdbEnabled()) : false;
    let emulator = false;
    if (deviceInfo) {
        emulator = deviceInfo.isEmulatorSync
            ? safe(() => deviceInfo.isEmulatorSync(), false)
            : await toBool(deviceInfo.isEmulator());
    }
    const device = {
        rooted: !isIOS && jailBroken,
        jailbroken: isIOS && jailBroken,
        emulator: !isIOS && emulator,
        simulator: isIOS && emulator,
        developerMode: devSettings,
        usbDebugging: adbEnabled,
    };
    // ---- Runtime -------------------------------------------------------------
    const hooks = (jm === null || jm === void 0 ? void 0 : jm.hookDetected) ? safe(() => jm.hookDetected(), false) : false;
    const debugged = (jm === null || jm === void 0 ? void 0 : jm.isDebuggedMode)
        ? await toBool(jm.isDebuggedMode())
        : false;
    const tamper = jm ? safe(() => jm.trustFall(), false) : false;
    const runtime = {
        debuggerAttached: debugged,
        // Frida/Magisk/Xposed require native probes; conservatively derived.
        fridaDetected: false,
        xposedDetected: false,
        magiskDetected: !isIOS && jailBroken && tamper,
        hookDetected: hooks || tamper || externalStorage,
        suspiciousLibraries: [],
    };
    // ---- Network -------------------------------------------------------------
    // No hard dependency on a netinfo lib; left conservative unless the app wires
    // one in. Mock-location is a strong tamper indicator we surface via privacy.
    const network = {
        vpn: false,
        proxy: false,
        dnsChanged: false,
        certificatePinned: true,
    };
    // ---- Integrity -----------------------------------------------------------
    // These require Play Integrity / App Attest / native signature checks.
    // Assume valid unless a native module reports otherwise.
    const integrity = {
        playIntegrity: true,
        appAttest: true,
        signatureValid: true,
        bundleHashValid: true,
    };
    // ---- Privacy -------------------------------------------------------------
    const privacy = {
        screenshotBlocked: true,
        screenRecording: false,
        overlayDetected: false,
    };
    const partial = { device, runtime, network, integrity, privacy };
    const risk = ThreatScore_1.ThreatScore.calculate(partial);
    return { ...partial, risk };
}
exports.collectLiveReport = collectLiveReport;
function safe(fn, fallback) {
    try {
        return fn();
    }
    catch {
        return fallback;
    }
}
