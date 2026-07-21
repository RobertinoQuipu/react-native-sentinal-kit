"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IBMTrusteerProvider = void 0;
const platform_1 = require("../platform");
const net_1 = require("../net");
const Native = platform_1.NativeModules.IBMTrusteer;
exports.IBMTrusteerProvider = {
    id: 'trusteer',
    name: 'IBM Security Trusteer',
    regions: ['MACEDONIA'],
    async evaluate(ctx) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (Native && typeof Native.assess === 'function') {
            const res = await Native.assess({ customerId: 'YOUR_TRUSTEER_CUSTOMER_ID' });
            return {
                id: 'trusteer',
                name: 'IBM Security Trusteer',
                native: true,
                signals: [
                    sig('riskScore', `Risk score: ${res.riskScore}/1000`, res.riskScore >= 500, 45),
                    sig('malware', 'Malware detected', res.malwareDetected, 50),
                    sig('rat', 'Remote access tool (RAT)', res.rat, 40),
                    sig('emulator', 'Emulator', res.emulator, 15),
                    sig('rooted', 'Rooted / jailbroken', res.rooted, 40),
                    sig('overlay', 'Screen overlay', res.overlayDetected, 20),
                    sig('vpn', 'VPN in use', res.vpn, 10),
                    sig('call', 'Call in progress (social eng.)', res.callInProgress, 15),
                ],
            };
        }
        // Direct vendor REST call (only when sandbox is disabled and a configured
        // endpoint + credentials are present).
        const cfg = (0, net_1.getConfig)();
        const trusteer = cfg.trusteer;
        if (cfg.sandbox === false && (trusteer === null || trusteer === void 0 ? void 0 : trusteer.baseUrl) && trusteer.apiKey) {
            try {
                const res = await (0, net_1.httpJson)({
                    url: trusteer.baseUrl,
                    method: 'POST',
                    headers: { Authorization: `Bearer ${trusteer.apiKey}` },
                    body: {
                        customerId: trusteer.customerId,
                        deviceContext: ctx.base,
                    },
                    timeoutMs: cfg.timeoutMs,
                    retries: cfg.retries,
                });
                return {
                    id: 'trusteer',
                    name: 'IBM Security Trusteer',
                    native: true,
                    signals: [
                        sig('riskScore', `Risk score: ${res.riskScore}/1000`, res.riskScore >= 500, 45),
                        sig('malware', 'Malware detected', (_a = res.malwareDetected) !== null && _a !== void 0 ? _a : false, 50),
                        sig('rat', 'Remote access tool (RAT)', (_b = res.rat) !== null && _b !== void 0 ? _b : false, 40),
                        sig('emulator', 'Emulator', (_c = res.emulator) !== null && _c !== void 0 ? _c : false, 15),
                        sig('rooted', 'Rooted / jailbroken', (_d = res.rooted) !== null && _d !== void 0 ? _d : false, 40),
                        sig('overlay', 'Screen overlay', (_e = res.overlayDetected) !== null && _e !== void 0 ? _e : false, 20),
                        sig('a11y', 'Accessibility abuse', (_f = res.accessibilityRisk) !== null && _f !== void 0 ? _f : false, 25),
                        sig('vpn', 'VPN in use', (_g = res.vpn) !== null && _g !== void 0 ? _g : false, 10),
                        sig('call', 'Call in progress (social eng.)', ((_j = (_h = res.recommendations) === null || _h === void 0 ? void 0 : _h.length) !== null && _j !== void 0 ? _j : 0) > 0, 15),
                    ],
                };
            }
            catch (err) {
                if (__DEV__) {
                    // eslint-disable-next-line no-console
                    console.warn('[IBMTrusteerProvider] Trusteer REST call failed, falling back to simulated assessment:', err instanceof net_1.HttpError ? `HTTP ${err.status}` : err);
                }
                // Fall through to the simulated assessment below.
            }
        }
        // Derived Trusteer assessment from real base signals (used when the
        // Trusteer Mobile SDK is not linked). Risk score is computed from the
        // actual device/runtime/network/privacy findings.
        const { device, runtime, privacy, network, remoteAccess } = ctx.base;
        const activeRat = remoteAccess.remoteAccessApps.some(a => a.active);
        const installedRat = remoteAccess.remoteAccessApps.some(a => a.installed);
        const rat = activeRat || (network.proxy && privacy.screenRecording) || false;
        const overlay = privacy.overlayDetected || remoteAccess.overlayDetected;
        const riskScore = Math.min(1000, (device.rooted || device.jailbroken ? 400 : 0) +
            (runtime.suspiciousLibraries.length > 0 ? 300 : 0) +
            (activeRat ? 350 : installedRat ? 150 : 0) +
            (device.emulator || device.simulator ? 150 : 0) +
            (overlay ? 120 : 0) +
            (remoteAccess.accessibilityRisk ? 150 : 0) +
            (runtime.hookDetected ? 120 : 0) +
            (network.vpn ? 60 : 0));
        const ratApps = remoteAccess.remoteAccessApps
            .map(a => a.name)
            .join(', ');
        return {
            id: 'trusteer',
            name: 'IBM Security Trusteer',
            native: false,
            signals: [
                sig('riskScore', `Risk score: ${riskScore}/1000`, riskScore >= 500, 45),
                sig('malware', 'Malware detected', runtime.suspiciousLibraries.length > 0, 50),
                {
                    key: 'rat',
                    label: 'Remote access tool (RAT)',
                    flagged: rat,
                    weight: 40,
                    detail: ratApps || undefined,
                },
                sig('emulator', 'Emulator', device.emulator || device.simulator, 15),
                sig('rooted', 'Rooted / jailbroken', device.rooted || device.jailbroken, 40),
                sig('overlay', 'Screen overlay', overlay, 20),
                sig('a11y', 'Accessibility abuse', remoteAccess.accessibilityRisk, 25),
                sig('vpn', 'VPN in use', network.vpn, 10),
                sig('call', 'Call in progress (social eng.)', false, 15),
            ],
        };
    },
};
function sig(key, label, flagged, weight) {
    return { key, label, flagged, weight };
}
