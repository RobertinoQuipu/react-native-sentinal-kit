"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riskLevelForScore = exports.THREAT_LABELS = exports.THREAT_WEIGHTS = void 0;
/**
 * Penalty weights applied to the base score (100) per detected threat.
 * Tune these to match your organization's risk appetite.
 */
exports.THREAT_WEIGHTS = {
    rooted: 40,
    jailbroken: 40,
    emulator: 15,
    simulator: 15,
    developerMode: 8,
    usbDebugging: 12,
    debuggerAttached: 20,
    fridaDetected: 50,
    xposedDetected: 30,
    magiskDetected: 35,
    hookDetected: 30,
    suspiciousLibrary: 10,
    vpn: 10,
    proxy: 12,
    dnsChanged: 8,
    signatureInvalid: 45,
    bundleHashInvalid: 45,
    playIntegrityFailed: 25,
    appAttestFailed: 25,
    screenRecording: 10,
    overlayDetected: 20,
    remoteAccessAppInstalled: 20,
    remoteAccessAppActive: 45,
    accessibilityRisk: 25,
    screenCaptured: 15,
};
/**
 * Human-readable labels for each threat, surfaced in RiskReport.threats.
 */
exports.THREAT_LABELS = {
    rooted: 'Device is rooted',
    jailbroken: 'Device is jailbroken',
    emulator: 'Running on an emulator',
    simulator: 'Running on a simulator',
    developerMode: 'Developer mode enabled',
    usbDebugging: 'USB debugging enabled',
    debuggerAttached: 'Debugger attached',
    fridaDetected: 'Frida instrumentation detected',
    xposedDetected: 'Xposed framework detected',
    magiskDetected: 'Magisk detected',
    hookDetected: 'Runtime hooking detected',
    suspiciousLibrary: 'Suspicious library loaded',
    vpn: 'VPN connection active',
    proxy: 'HTTP proxy configured',
    dnsChanged: 'Custom DNS configured',
    signatureInvalid: 'App signature invalid',
    bundleHashInvalid: 'Bundle hash mismatch',
    playIntegrityFailed: 'Play Integrity check failed',
    appAttestFailed: 'App Attest check failed',
    screenRecording: 'Screen recording in progress',
    overlayDetected: 'Screen overlay detected',
    remoteAccessAppInstalled: 'Remote-access app installed',
    remoteAccessAppActive: 'Remote-access app active',
    accessibilityRisk: 'Accessibility abuse risk',
    screenCaptured: 'Screen is being captured',
};
function riskLevelForScore(score) {
    if (score >= 80) {
        return 'LOW';
    }
    if (score >= 55) {
        return 'MEDIUM';
    }
    if (score >= 30) {
        return 'HIGH';
    }
    return 'CRITICAL';
}
exports.riskLevelForScore = riskLevelForScore;
