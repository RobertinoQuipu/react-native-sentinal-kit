"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetConfig = exports.getConfig = exports.configure = void 0;
const DEFAULT_CONFIG = {
    sandbox: true,
    timeoutMs: 8000,
    retries: 2,
};
let currentConfig = { ...DEFAULT_CONFIG };
const isDev = typeof __DEV__ !== 'undefined'
    ? Boolean(__DEV__)
    : ((_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.NODE_ENV) !== 'production';
function configure(partial) {
    if (partial.sandbox === false && isDev) {
        // eslint-disable-next-line no-console
        console.warn('[react-native-security-kit] sandbox mode disabled. Shipping vendor API keys in a mobile app is insecure; prefer proxying vendor calls through your own backend.');
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
