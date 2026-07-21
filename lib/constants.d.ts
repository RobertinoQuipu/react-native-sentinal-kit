import { RiskLevel } from './types';
/**
 * Penalty weights applied to the base score (100) per detected threat.
 * Tune these to match your organization's risk appetite.
 */
export declare const THREAT_WEIGHTS: {
    readonly rooted: 40;
    readonly jailbroken: 40;
    readonly emulator: 15;
    readonly simulator: 15;
    readonly developerMode: 8;
    readonly usbDebugging: 12;
    readonly debuggerAttached: 20;
    readonly fridaDetected: 50;
    readonly xposedDetected: 30;
    readonly magiskDetected: 35;
    readonly hookDetected: 30;
    readonly suspiciousLibrary: 10;
    readonly vpn: 10;
    readonly proxy: 12;
    readonly dnsChanged: 8;
    readonly signatureInvalid: 45;
    readonly bundleHashInvalid: 45;
    readonly playIntegrityFailed: 25;
    readonly appAttestFailed: 25;
    readonly screenRecording: 10;
    readonly overlayDetected: 20;
    readonly remoteAccessAppInstalled: 20;
    readonly remoteAccessAppActive: 45;
    readonly accessibilityRisk: 25;
    readonly screenCaptured: 15;
};
/**
 * Human-readable labels for each threat, surfaced in RiskReport.threats.
 */
export declare const THREAT_LABELS: Record<string, string>;
export declare function riskLevelForScore(score: number): RiskLevel;
