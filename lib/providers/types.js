"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGION_LABELS = exports.REGION_PROVIDERS = exports.signal = void 0;
/** Shared helper to build a ProviderSignal. */
function signal(key, label, flagged, weight, detail) {
    return { key, label, flagged, weight, detail };
}
exports.signal = signal;
exports.REGION_PROVIDERS = {
    MOLDOVA: ['lexisnexis', 'jailmonkey'],
    MACEDONIA: ['trusteer', 'jailmonkey'],
};
exports.REGION_LABELS = {
    MOLDOVA: '🇲🇩 Moldova',
    MACEDONIA: '🇲🇰 North Macedonia',
};
