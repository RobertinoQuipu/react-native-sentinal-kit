"use strict";
/**
 * Platform shim.
 *
 * This package is designed to run in two environments:
 *   1. Inside a React Native app (where `react-native` provides NativeModules
 *      and Platform, and the real native security SDKs may be linked).
 *   2. As a local Node CLI that generates a report file (no react-native).
 *
 * We resolve `react-native` lazily so importing the package in Node does not
 * throw. When it is unavailable we fall back to safe stubs, which drives the
 * built-in JS simulation engine.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Platform = exports.NativeModules = void 0;
function load() {
    var _a;
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const rn = require('react-native');
        if (rn && rn.Platform) {
            return { NativeModules: (_a = rn.NativeModules) !== null && _a !== void 0 ? _a : {}, Platform: rn.Platform };
        }
    }
    catch {
        // not in a react-native environment
    }
    const os = (process === null || process === void 0 ? void 0 : process.platform) === 'darwin' ? 'node-macos' : 'node';
    const Platform = {
        OS: os,
        select: spec => spec.default,
    };
    return { NativeModules: {}, Platform };
}
const shim = load();
exports.NativeModules = shim.NativeModules;
exports.Platform = shim.Platform;
