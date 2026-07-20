"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allRows = void 0;
function baseRows(report) {
    const { device, runtime, network, integrity, privacy } = report.base;
    const rows = [];
    const add = (category, check, flagged, detail = '') => rows.push({
        category,
        check,
        status: flagged ? 'FLAGGED' : 'CLEAR',
        detail,
    });
    add('Device', 'Rooted', device.rooted);
    add('Device', 'Jailbroken', device.jailbroken);
    add('Device', 'Emulator', device.emulator);
    add('Device', 'Simulator', device.simulator);
    add('Device', 'Developer mode', device.developerMode);
    add('Device', 'USB debugging', device.usbDebugging);
    add('Runtime', 'Debugger attached', runtime.debuggerAttached);
    add('Runtime', 'Frida', runtime.fridaDetected);
    add('Runtime', 'Xposed', runtime.xposedDetected);
    add('Runtime', 'Magisk', runtime.magiskDetected);
    add('Runtime', 'Runtime hooks', runtime.hookDetected);
    add('Runtime', 'Suspicious libraries', runtime.suspiciousLibraries.length > 0, runtime.suspiciousLibraries.join(' | '));
    add('Network', 'VPN active', network.vpn);
    add('Network', 'Proxy configured', network.proxy);
    add('Network', 'DNS changed', network.dnsChanged);
    add('Network', 'Certificate pinning', !network.certificatePinned);
    add('Integrity', 'Play Integrity', !integrity.playIntegrity);
    add('Integrity', 'App Attest', !integrity.appAttest);
    add('Integrity', 'Signature valid', !integrity.signatureValid);
    add('Integrity', 'Bundle hash valid', !integrity.bundleHashValid);
    add('Privacy', 'Screenshot blocking', !privacy.screenshotBlocked);
    add('Privacy', 'Screen recording', privacy.screenRecording);
    add('Privacy', 'Overlay detected', privacy.overlayDetected);
    return rows;
}
function providerRows(report) {
    var _a;
    const rows = [];
    for (const p of report.assessment.providers) {
        for (const s of p.signals) {
            rows.push({
                category: `Provider: ${p.name}${p.native ? '' : ' (simulated)'}`,
                check: s.label,
                status: s.flagged ? 'FLAGGED' : 'CLEAR',
                detail: (_a = s.detail) !== null && _a !== void 0 ? _a : '',
            });
        }
    }
    return rows;
}
function allRows(report) {
    return [...baseRows(report), ...providerRows(report)];
}
exports.allRows = allRows;
