"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LexisNexisProvider = void 0;
const platform_1 = require("../platform");
const net_1 = require("../net");
const Native = platform_1.NativeModules.LexisNexisThreatMetrix;
exports.LexisNexisProvider = {
    id: 'lexisnexis',
    name: 'LexisNexis ThreatMetrix',
    regions: ['MOLDOVA'],
    async evaluate(ctx) {
        var _a, _b, _c, _d, _e;
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
        // Direct vendor REST call (only when sandbox is disabled and a configured
        // endpoint + credentials are present).
        const cfg = (0, net_1.getConfig)();
        const tmx = cfg.threatmetrix;
        if (cfg.sandbox === false && (tmx === null || tmx === void 0 ? void 0 : tmx.baseUrl) && tmx.apiKey) {
            try {
                const sessionId = `mdl-${Date.now()}`;
                const res = await (0, net_1.httpJson)({
                    url: tmx.baseUrl,
                    method: 'POST',
                    body: {
                        org_id: tmx.orgId,
                        api_key: tmx.apiKey,
                        session_id: sessionId,
                        service_type: 'session-policy',
                    },
                    timeoutMs: cfg.timeoutMs,
                    retries: cfg.retries,
                });
                const highRisk = res.risk_rating === 'high' || res.risk_rating === 'medium';
                return {
                    id: 'lexisnexis',
                    name: 'LexisNexis ThreatMetrix',
                    native: true,
                    signals: [
                        sig('riskRating', `Risk rating: ${res.risk_rating}`, highRisk, 45),
                        sig('vpn', 'VPN detected', (_a = res.vpn) !== null && _a !== void 0 ? _a : false, 10),
                        sig('proxy', 'Proxy detected', (_b = res.proxy) !== null && _b !== void 0 ? _b : false, 12),
                        sig('tor', 'TOR exit node', (_c = res.tor) !== null && _c !== void 0 ? _c : false, 25),
                        sig('emulator', 'Emulator', (_d = res.emulator) !== null && _d !== void 0 ? _d : false, 15),
                        ...((_e = res.reasons) !== null && _e !== void 0 ? _e : []).map((r, i) => sig(`reason-${i}`, r, true, 8)),
                    ],
                };
            }
            catch (err) {
                if (__DEV__) {
                    // eslint-disable-next-line no-console
                    console.warn('[LexisNexisProvider] ThreatMetrix REST call failed, falling back to simulated decision:', err instanceof net_1.HttpError ? `HTTP ${err.status}` : err);
                }
                // Fall through to the simulated decision below.
            }
        }
        // Derived ThreatMetrix decision from real base signals (used when the
        // native TMX SDK is not linked).
        const { device, network, runtime } = ctx.base;
        const riskFactors = (device.rooted || device.jailbroken ? 1 : 0) +
            (device.emulator || device.simulator ? 1 : 0) +
            (network.vpn || network.proxy ? 1 : 0) +
            (runtime.hookDetected || runtime.debuggerAttached ? 1 : 0);
        const rating = riskFactors >= 2 ? 'high' : riskFactors === 1 ? 'medium' : 'trusted';
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
