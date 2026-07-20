import { SimulationProfile } from './simulation';
import { SecurityReport } from './types';
export declare const isNativeModuleAvailable: () => boolean;
export type ScanMode = 'native' | 'live' | 'simulated';
/**
 * SecurityKit is the single public entry point of the SDK.
 * It composes the per-domain reports and computes an aggregate risk score.
 */
declare class SecurityKitImpl {
    private activeProfile;
    private forceSimulation;
    private lastMode;
    /**
     * Demo helper: pick which simulated device profile the scan reflects.
     * Setting a profile forces simulation mode (used by the CLI/demo). Pass
     * `null` to return to automatic live/native detection.
     */
    setSimulationProfile(index: number | null): void;
    getSimulationProfiles(): SimulationProfile[];
    get usingNativeModule(): boolean;
    /** How the most recent scan obtained its base data. */
    get mode(): ScanMode;
    /** True when real on-device detection libraries (e.g. jail-monkey) are linked. */
    get hasLiveSignals(): boolean;
    /**
     * Run a full security scan and return an aggregated report.
     *
     * Resolution order:
     *   1. Native SecurityKit module, if linked.
     *   2. Live on-device signals (jail-monkey / device-info), if available
     *      and simulation is not forced.
     *   3. Simulated device profile (demo / Node fallback).
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
