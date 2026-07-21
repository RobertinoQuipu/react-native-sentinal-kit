"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetConfig = exports.getConfig = exports.configure = void 0;
const platform_1 = require("./platform");
const DEFAULT_CONFIG = {
    sandbox: true,
    timeoutMs: 8000,
    retries: 2,
};
let currentConfig = { ...DEFAULT_CONFIG };
function configure(partial) {
    if (partial.sandbox === false && (0, platform_1.isDev)()) {
        // eslint-disable-next-line no-console
        console.warn('[react-native-security-kit] sandbox disabled. Shipping vendor API keys ' +
            'in a mobile app is insecure; prefer proxying vendor calls through your ' +
            'own backend.');
    }
    currentConfig = { ...currentConfig, ...partial };
}
exports.configure = configure;
function getConfig() {
    return currentConfig;
}
exports.getConfig = getConfig;
function resetConfig() {
    currentConfig = { ...DEFAULT_CONFIG };
}
exports.resetConfig = resetConfig;
