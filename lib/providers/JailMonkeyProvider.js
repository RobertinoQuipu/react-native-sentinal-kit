"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JailMonkeyProvider = void 0;
const types_1 = require("./types");
function loadJailMonkey() {
    var _a;
    try {
        // Lazily required so the demo runs even if the module isn't installed/linked.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require('jail-monkey');
        const api = ((_a = mod === null || mod === void 0 ? void 0 : mod.default) !== null && _a !== void 0 ? _a : mod);
        if (api && typeof api.isJailBroken === 'function') {
            return api;
        }
        return null;
    }
    catch {
        return null;
    }
}
exports.JailMonkeyProvider = {
    id: 'jailmonkey',
    name: 'JailMonkey',
    regions: ['MOLDOVA', 'MACEDONIA'],
    async evaluate(ctx) {
        var _a, _b, _c, _d, _e, _f;
        const jm = loadJailMonkey();
        if (jm) {
            const [debugged, devSettings] = await Promise.all([
                Promise.resolve((_b = (_a = jm.isDebuggedMode) === null || _a === void 0 ? void 0 : _a.call(jm)) !== null && _b !== void 0 ? _b : false),
                Promise.resolve((_d = (_c = jm.isDevelopmentSettingsMode) === null || _c === void 0 ? void 0 : _c.call(jm)) !== null && _d !== void 0 ? _d : false),
            ]);
            return {
                id: 'jailmonkey',
                name: 'JailMonkey',
                native: true,
                signals: [
                    (0, types_1.signal)('jailbroken', 'Jailbroken / rooted', jm.isJailBroken(), 40),
                    (0, types_1.signal)('mockLocation', 'Mock location allowed', jm.canMockLocation(), 12),
                    (0, types_1.signal)('trustFall', 'Trust fall (tamper)', jm.trustFall(), 30),
                    (0, types_1.signal)('hooks', 'Runtime hooks', (_f = (_e = jm.hookDetected) === null || _e === void 0 ? void 0 : _e.call(jm)) !== null && _f !== void 0 ? _f : false, 30),
                    (0, types_1.signal)('debugged', 'Debugged mode', !!debugged, 20),
                    (0, types_1.signal)('devSettings', 'Development settings', !!devSettings, 8),
                ],
            };
        }
        // Simulated fallback derived from the base report.
        const { device, runtime } = ctx.base;
        const jailed = device.rooted || device.jailbroken;
        return {
            id: 'jailmonkey',
            name: 'JailMonkey',
            native: false,
            signals: [
                (0, types_1.signal)('jailbroken', 'Jailbroken / rooted', jailed, 40),
                (0, types_1.signal)('mockLocation', 'Mock location allowed', device.developerMode, 12),
                (0, types_1.signal)('trustFall', 'Trust fall (tamper)', runtime.hookDetected, 30),
                (0, types_1.signal)('hooks', 'Runtime hooks', runtime.hookDetected, 30),
                (0, types_1.signal)('debugged', 'Debugged mode', runtime.debuggerAttached, 20),
                (0, types_1.signal)('devSettings', 'Development settings', device.developerMode, 8),
            ],
        };
    },
};
