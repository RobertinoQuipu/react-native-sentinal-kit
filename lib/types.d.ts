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
/** A remote-access / screen-sharing app detected on the device. */
export interface RemoteAccessApp {
    name: string;
    /** The app is installed on the device. */
    installed: boolean;
    /** The app appears to be actively running / sharing the screen. */
    active: boolean;
    /** Detection confidence, 0..1. */
    confidence: number;
}
/**
 * Remote-access, overlay and screen-capture signals — the classic vectors for
 * social-engineering fraud (RAT tools, screen sharing, tap-jacking overlays,
 * accessibility abuse).
 */
export interface RemoteAccessReport {
    remoteAccessApps: RemoteAccessApp[];
    overlayDetected: boolean;
    accessibilityRisk: boolean;
    screenCaptured: boolean;
    debuggerAttached: boolean;
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
    remoteAccess: RemoteAccessReport;
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
