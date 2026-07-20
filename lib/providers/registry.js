"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessRegion = void 0;
const IBMTrusteerProvider_1 = require("./IBMTrusteerProvider");
const JailMonkeyProvider_1 = require("./JailMonkeyProvider");
const LexisNexisProvider_1 = require("./LexisNexisProvider");
const types_1 = require("./types");
const constants_1 = require("../constants");
const REGISTRY = {
    jailmonkey: JailMonkeyProvider_1.JailMonkeyProvider,
    lexisnexis: LexisNexisProvider_1.LexisNexisProvider,
    trusteer: IBMTrusteerProvider_1.IBMTrusteerProvider,
};
/**
 * Runs all providers configured for `region`, then aggregates their signals
 * into a single trust score (100 down to 0) and severity level.
 */
async function assessRegion(region, base, profileIndex) {
    const ids = types_1.REGION_PROVIDERS[region];
    const ctx = { region, base, profileIndex };
    const providers = await Promise.all(ids.map(id => REGISTRY[id].evaluate(ctx)));
    let score = 100;
    const threats = [];
    for (const p of providers) {
        for (const s of p.signals) {
            if (s.flagged) {
                score -= s.weight;
                threats.push(`[${p.name}] ${s.label}`);
            }
        }
    }
    const clamped = Math.max(0, Math.min(100, score));
    return {
        region,
        providers,
        score: clamped,
        level: (0, constants_1.riskLevelForScore)(clamped),
        threats,
    };
}
exports.assessRegion = assessRegion;
