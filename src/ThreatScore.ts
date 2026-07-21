import {THREAT_LABELS, THREAT_WEIGHTS, riskLevelForScore} from './constants';
import {RiskReport, SecurityReport} from './types';

type OmitRisk = Omit<SecurityReport, 'risk'>;

/**
 * ThreatScore turns a set of raw signals into a 0-100 trust score,
 * a severity level, and a list of human-readable threats.
 *
 * The score starts at 100 (fully trusted) and each detected signal
 * subtracts its configured weight.
 */
export class ThreatScore {
  static calculate(report: OmitRisk): RiskReport {
    let score = 100;
    const threats: string[] = [];

    const penalize = (weight: number, key: string) => {
      score -= weight;
      const label = THREAT_LABELS[key];
      if (label) {
        threats.push(label);
      }
    };

    const {device, runtime, network, integrity, privacy, remoteAccess} =
      report;

    if (device.rooted) penalize(THREAT_WEIGHTS.rooted, 'rooted');
    if (device.jailbroken) penalize(THREAT_WEIGHTS.jailbroken, 'jailbroken');
    if (device.emulator) penalize(THREAT_WEIGHTS.emulator, 'emulator');
    if (device.simulator) penalize(THREAT_WEIGHTS.simulator, 'simulator');
    if (device.developerMode)
      penalize(THREAT_WEIGHTS.developerMode, 'developerMode');
    if (device.usbDebugging)
      penalize(THREAT_WEIGHTS.usbDebugging, 'usbDebugging');

    if (runtime.debuggerAttached)
      penalize(THREAT_WEIGHTS.debuggerAttached, 'debuggerAttached');
    if (runtime.fridaDetected)
      penalize(THREAT_WEIGHTS.fridaDetected, 'fridaDetected');
    if (runtime.xposedDetected)
      penalize(THREAT_WEIGHTS.xposedDetected, 'xposedDetected');
    if (runtime.magiskDetected)
      penalize(THREAT_WEIGHTS.magiskDetected, 'magiskDetected');
    if (runtime.hookDetected)
      penalize(THREAT_WEIGHTS.hookDetected, 'hookDetected');
    runtime.suspiciousLibraries.forEach(lib => {
      score -= THREAT_WEIGHTS.suspiciousLibrary;
      threats.push(`Suspicious library loaded: ${lib}`);
    });

    if (network.vpn) penalize(THREAT_WEIGHTS.vpn, 'vpn');
    if (network.proxy) penalize(THREAT_WEIGHTS.proxy, 'proxy');
    if (network.dnsChanged) penalize(THREAT_WEIGHTS.dnsChanged, 'dnsChanged');

    if (!integrity.signatureValid)
      penalize(THREAT_WEIGHTS.signatureInvalid, 'signatureInvalid');
    if (!integrity.bundleHashValid)
      penalize(THREAT_WEIGHTS.bundleHashInvalid, 'bundleHashInvalid');
    if (!integrity.playIntegrity)
      penalize(THREAT_WEIGHTS.playIntegrityFailed, 'playIntegrityFailed');
    if (!integrity.appAttest)
      penalize(THREAT_WEIGHTS.appAttestFailed, 'appAttestFailed');

    if (privacy.screenRecording)
      penalize(THREAT_WEIGHTS.screenRecording, 'screenRecording');
    if (privacy.overlayDetected)
      penalize(THREAT_WEIGHTS.overlayDetected, 'overlayDetected');

    if (remoteAccess.overlayDetected && !privacy.overlayDetected)
      penalize(THREAT_WEIGHTS.overlayDetected, 'overlayDetected');
    if (remoteAccess.accessibilityRisk)
      penalize(THREAT_WEIGHTS.accessibilityRisk, 'accessibilityRisk');
    if (remoteAccess.screenCaptured && !privacy.screenRecording)
      penalize(THREAT_WEIGHTS.screenCaptured, 'screenCaptured');
    remoteAccess.remoteAccessApps.forEach(app => {
      if (app.active) {
        score -= THREAT_WEIGHTS.remoteAccessAppActive;
        threats.push(`Remote-access app active: ${app.name}`);
      } else if (app.installed) {
        score -= THREAT_WEIGHTS.remoteAccessAppInstalled;
        threats.push(`Remote-access app installed: ${app.name}`);
      }
    });

    const clamped = Math.max(0, Math.min(100, score));

    return {
      score: clamped,
      level: riskLevelForScore(clamped),
      threats,
    };
  }
}
