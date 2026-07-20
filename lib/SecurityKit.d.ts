import { SimulationProfile } from './simulation';
import { SecurityReport } from './types';
export declare const isNativeModuleAvailable: () => boolean;
/**
 * SecurityKit is the single public entry point of the SDK.
 * It composes the per-domain reports and computes an aggregate risk score.
 */
declare class SecurityKitImpl {
    private activeProfile;
    /** Demo helper: pick which simulated device profile the scan reflects. */
    setSimulationProfile(index: number): void;
    getSimulationProfiles(): SimulationProfile[];
    get usingNativeModule(): boolean;
    /**
     * Run a full security scan and return an aggregated report.
     */
    scan(): Promise<SecurityReport>;
    getRiskScore(): Promise<number>;
    isRooted: () => Promise<boolean>;
    isJailbroken: () => Promise<boolean>;
    isEmulator: () => Promise<boolean>;
    isDeveloperMode: () => Promise<boolean>;
    isUsbDebuggingEnabled: () => Promise<boolean>;
    isDebuggerAttached: () => Promise<boolean>;
    isVpnEnabled: () => Promise<boolean>;
    isProxyEnabled: () => Promise<boolean>;
    isScreenCaptured: () => Promise<boolean>;
    private field;
}
declare const SecurityKit: SecurityKitImpl;
export default SecurityKit;
