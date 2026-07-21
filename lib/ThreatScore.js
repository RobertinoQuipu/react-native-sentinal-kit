"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreatScore = void 0;
const constants_1 = require("./constants");
/**
 * ThreatScore turns a set of raw signals into a 0-100 trust score,
 * a severity level, and a list of human-readable threats.
 *
 * The score starts at 100 (fully trusted) and each detected signal
 * subtracts its configured weight.
 */
class ThreatScore {
    static calculate(report) {
        let score = 100;
        const threats = [];
        const penalize = (weight, key) => {
            score -= weight;
            const label = constants_1.THREAT_LABELS[key];
            if (label) {
                threats.push(label);
            }
        };
        const { device, runtime, network, integrity, privacy, remoteAccess } = report;
        if (device.rooted)
            penalize(constants_1.THREAT_WEIGHTS.rooted, 'rooted');
        if (device.jailbroken)
            penalize(constants_1.THREAT_WEIGHTS.jailbroken, 'jailbroken');
        if (device.emulator)
            penalize(constants_1.THREAT_WEIGHTS.emulator, 'emulator');
        if (device.simulator)
            penalize(constants_1.THREAT_WEIGHTS.simulator, 'simulator');
        if (device.developerMode)
            penalize(constants_1.THREAT_WEIGHTS.developerMode, 'developerMode');
        if (device.usbDebugging)
            penalize(constants_1.THREAT_WEIGHTS.usbDebugging, 'usbDebugging');
        if (runtime.debuggerAttached)
            penalize(constants_1.THREAT_WEIGHTS.debuggerAttached, 'debuggerAttached');
        if (runtime.fridaDetected)
            penalize(constants_1.THREAT_WEIGHTS.fridaDetected, 'fridaDetected');
        if (runtime.xposedDetected)
            penalize(constants_1.THREAT_WEIGHTS.xposedDetected, 'xposedDetected');
        if (runtime.magiskDetected)
            penalize(constants_1.THREAT_WEIGHTS.magiskDetected, 'magiskDetected');
        if (runtime.hookDetected)
            penalize(constants_1.THREAT_WEIGHTS.hookDetected, 'hookDetected');
        runtime.suspiciousLibraries.forEach(lib => {
            score -= constants_1.THREAT_WEIGHTS.suspiciousLibrary;
            threats.push(`Suspicious library loaded: ${lib}`);
        });
        if (network.vpn)
            penalize(constants_1.THREAT_WEIGHTS.vpn, 'vpn');
        if (network.proxy)
            penalize(constants_1.THREAT_WEIGHTS.proxy, 'proxy');
        if (network.dnsChanged)
            penalize(constants_1.THREAT_WEIGHTS.dnsChanged, 'dnsChanged');
        if (!integrity.signatureValid)
            penalize(constants_1.THREAT_WEIGHTS.signatureInvalid, 'signatureInvalid');
        if (!integrity.bundleHashValid)
            penalize(constants_1.THREAT_WEIGHTS.bundleHashInvalid, 'bundleHashInvalid');
        if (!integrity.playIntegrity)
            penalize(constants_1.THREAT_WEIGHTS.playIntegrityFailed, 'playIntegrityFailed');
        if (!integrity.appAttest)
            penalize(constants_1.THREAT_WEIGHTS.appAttestFailed, 'appAttestFailed');
        if (privacy.screenRecording)
            penalize(constants_1.THREAT_WEIGHTS.screenRecording, 'screenRecording');
        if (privacy.overlayDetected)
            penalize(constants_1.THREAT_WEIGHTS.overlayDetected, 'overlayDetected');
        if (remoteAccess.overlayDetected && !privacy.overlayDetected)
            penalize(constants_1.THREAT_WEIGHTS.overlayDetected, 'overlayDetected');
        if (remoteAccess.accessibilityRisk)
            penalize(constants_1.THREAT_WEIGHTS.accessibilityRisk, 'accessibilityRisk');
        if (remoteAccess.screenCaptured && !privacy.screenRecording)
            penalize(constants_1.THREAT_WEIGHTS.screenCaptured, 'screenCaptured');
        remoteAccess.remoteAccessApps.forEach(app => {
            if (app.active) {
                score -= constants_1.THREAT_WEIGHTS.remoteAccessAppActive;
                threats.push(`Remote-access app active: ${app.name}`);
            }
            else if (app.installed) {
                score -= constants_1.THREAT_WEIGHTS.remoteAccessAppInstalled;
                threats.push(`Remote-access app installed: ${app.name}`);
            }
        });
        const clamped = Math.max(0, Math.min(100, score));
        return {
            score: clamped,
            level: (0, constants_1.riskLevelForScore)(clamped),
            threats,
        };
    }
}
exports.ThreatScore = ThreatScore;
