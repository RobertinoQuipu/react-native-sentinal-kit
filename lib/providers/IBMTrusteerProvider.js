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
        // Simulated Trusteer assessment from base signals.
        const { device, runtime, privacy, network } = ctx.base;
        const riskScore = ctx.profileIndex >= 2 ? 720 : ctx.profileIndex === 1 ? 380 : 90;
        return {
            id: 'trusteer',
            name: 'IBM Security Trusteer',
            native: false,
            signals: [
                sig('riskScore', `Risk score: ${riskScore}/1000`, riskScore >= 500, 45),
                sig('malware', 'Malware detected', runtime.suspiciousLibraries.length > 0, 50),
                sig('rat', 'Remote access tool (RAT)', network.proxy && privacy.screenRecording, 40),
                sig('emulator', 'Emulator', device.emulator || device.simulator, 15),
                sig('rooted', 'Rooted / jailbroken', device.rooted || device.jailbroken, 40),
                sig('overlay', 'Screen overlay', privacy.overlayDetected, 20),
                sig('vpn', 'VPN in use', network.vpn, 10),
                sig('call', 'Call in progress (social eng.)', false, 15),
            ],
        };
    },
};
function sig(key, label, flagged, weight) {
    return { key, label, flagged, weight };
}
