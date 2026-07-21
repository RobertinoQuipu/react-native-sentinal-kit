"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IBMTrusteerProvider = void 0;
const platform_1 = require("../platform");
const Native = platform_1.NativeModules.IBMTrusteer;
exports.IBMTrusteerProvider = {
    id: 'trusteer',
    name: 'IBM Security Trusteer',
    regions: ['MACEDONIA'],
    async evaluate(ctx) {
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
