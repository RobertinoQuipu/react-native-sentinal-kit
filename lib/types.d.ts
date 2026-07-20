/**
 * Public type definitions for react-native-security-kit.
 * These mirror the shape returned by SecurityKit.scan().
 */
export interface DeviceReport {
    rooted: boolean;
    jailbroken: boolean;
    emulator: boolean;
    simulator: boolean;
    developerMode: boolean;
    usbDebugging: boolean;
}
export interface RuntimeReport {
    debuggerAttached: boolean;
    fridaDetected: boolean;
    xposedDetected: boolean;
    magiskDetected: boolean;
    hookDetected: boolean;
    suspiciousLibraries: string[];
}
export interface NetworkReport {
    vpn: boolean;
    proxy: boolean;
    dnsChanged: boolean;
    certificatePinned: boolean;
}
export interface IntegrityReport {
    playIntegrity: boolean;
    appAttest: boolean;
    signatureValid: boolean;
    bundleHashValid: boolean;
}
export interface PrivacyReport {
    screenshotBlocked: boolean;
    screenRecording: boolean;
    overlayDetected: boolean;
}
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface RiskReport {
    score: number;
    level: RiskLevel;
    threats: string[];
}
export interface SecurityReport {
    device: DeviceReport;
    runtime: RuntimeReport;
    network: NetworkReport;
    integrity: IntegrityReport;
    privacy: PrivacyReport;
    risk: RiskReport;
}
/**
 * The native module contract. On platforms where the native module is not
 * linked, the JS layer transparently falls back to a simulated engine.
 */
export interface Spec {
    scan(): Promise<SecurityReport>;
    isRooted(): Promise<boolean>;
    isJailbroken(): Promise<boolean>;
    isDeveloperMode(): Promise<boolean>;
    isUsbDebuggingEnabled(): Promise<boolean>;
    isDebuggerAttached(): Promise<boolean>;
    isEmulator(): Promise<boolean>;
    isVpnEnabled(): Promise<boolean>;
    isProxyEnabled(): Promise<boolean>;
    isScreenCaptured(): Promise<boolean>;
    getRiskScore(): Promise<number>;
}
