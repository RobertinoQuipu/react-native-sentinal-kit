"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = void 0;
const SecurityKit_1 = __importDefault(require("../SecurityKit"));
const registry_1 = require("../providers/registry");
/**
 * Runs a complete scan for a region and returns an aggregated report object.
 *
 * - Omit `profileIndex` to scan the REAL device (native module or live
 *   on-device signals such as jail-monkey). This is what apps should use.
 * - Pass `profileIndex` (0..N) to force a simulated device profile, used by
 *   the demo CLI and for testing.
 */
async function generateReport(options) {
    var _a, _b;
    const simulate = typeof options.profileIndex === 'number';
    const profileIndex = simulate ? options.profileIndex : -1;
    SecurityKit_1.default.setSimulationProfile(simulate ? profileIndex : null);
    const base = await SecurityKit_1.default.scan();
    const assessment = await (0, registry_1.assessRegion)(options.region, base, profileIndex);
    const profiles = SecurityKit_1.default.getSimulationProfiles();
    const profileLabel = simulate
        ? (_b = (_a = profiles[Math.min(profileIndex, profiles.length - 1)]) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : 'unknown'
        : `Live device (${SecurityKit_1.default.mode})`;
    return {
        generatedAt: new Date().toISOString(),
        region: options.region,
        profileIndex,
        profileLabel,
        usingNativeModule: SecurityKit_1.default.usingNativeModule,
        mode: SecurityKit_1.default.mode,
        base,
        assessment,
    };
}
exports.generateReport = generateReport;
