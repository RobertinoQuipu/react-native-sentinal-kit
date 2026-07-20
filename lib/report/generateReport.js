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
 * Works both inside React Native (native SDKs when linked) and in Node
 * (JS simulation engine).
 */
async function generateReport(options) {
    var _a, _b, _c;
    const profileIndex = (_a = options.profileIndex) !== null && _a !== void 0 ? _a : 0;
    SecurityKit_1.default.setSimulationProfile(profileIndex);
    const base = await SecurityKit_1.default.scan();
    const assessment = await (0, registry_1.assessRegion)(options.region, base, profileIndex);
    const profiles = SecurityKit_1.default.getSimulationProfiles();
    const profileLabel = (_c = (_b = profiles[Math.min(profileIndex, profiles.length - 1)]) === null || _b === void 0 ? void 0 : _b.label) !== null && _c !== void 0 ? _c : 'unknown';
    return {
        generatedAt: new Date().toISOString(),
        region: options.region,
        profileIndex,
        profileLabel,
        usingNativeModule: SecurityKit_1.default.usingNativeModule,
        base,
        assessment,
    };
}
exports.generateReport = generateReport;
