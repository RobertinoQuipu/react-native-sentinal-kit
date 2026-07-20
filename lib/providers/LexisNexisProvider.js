"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexisNexisProvider = void 0;
const platform_1 = require("../platform");
const Native = platform_1.NativeModules.LexisNexisThreatMetrix;
exports.LexisNexisProvider = {
    id: 'lexisnexis',
    name: 'LexisNexis ThreatMetrix',
    regions: ['MOLDOVA'],
    async evaluate(ctx) {
        if (Native && typeof Native.profile === 'function') {
            const sessionId = `mdl-${Date.now()}`;
            const res = await Native.profile({
                // Replace with your LexisNexis org id / API key handling.
                orgId: 'YOUR_TMX_ORG_ID',
                sessionId,
            });
            const highRisk = res.riskRating === 'high' || res.riskRating === 'medium';
            return {
                id: 'lexisnexis',
                name: 'LexisNexis ThreatMetrix',
                native: true,
                signals: [
                    sig('riskRating', `Risk rating: ${res.riskRating}`, highRisk, 45),
                    sig('vpn', 'VPN detected', res.vpn, 10),
                    sig('proxy', 'Proxy detected', res.proxy, 12),
                    sig('tor', 'TOR exit node', res.tor, 25),
                    sig('emulator', 'Emulator', res.emulator, 15),
                    ...res.reasons.map((r, i) => sig(`reason-${i}`, r, true, 8)),
                ],
            };
        }
        // Simulated ThreatMetrix decision from base signals.
        const { device, network, runtime } = ctx.base;
        const rating = ctx.profileIndex >= 2
            ? 'high'
            : ctx.profileIndex === 1
                ? 'medium'
                : 'trusted';
        const highRisk = rating === 'high' || rating === 'medium';
        return {
            id: 'lexisnexis',
            name: 'LexisNexis ThreatMetrix',
            native: false,
            signals: [
                sig('riskRating', `Risk rating: ${rating}`, highRisk, 45),
                sig('vpn', 'VPN detected', network.vpn, 10),
                sig('proxy', 'Proxy detected', network.proxy, 12),
                sig('tor', 'TOR exit node', network.dnsChanged && network.proxy, 25),
                sig('emulator', 'Emulator', device.emulator || device.simulator, 15),
                sig('botSignature', 'Bot / automation signature', runtime.hookDetected, 20),
            ],
        };
    },
};
function sig(key, label, flagged, weight) {
    return { key, label, flagged, weight };
}
