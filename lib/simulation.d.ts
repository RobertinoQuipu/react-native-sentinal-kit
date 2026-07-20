import { DeviceReport, IntegrityReport, NetworkReport, PrivacyReport, RuntimeReport } from './types';
/**
 * A deterministic-ish simulated signal source used when the native module
 * is not linked (e.g. running the JS-only demo, tests, or web).
 *
 * A real build replaces this by wiring SecurityKitModule (Kotlin/Swift)
 * through NativeModules. The public API stays identical.
 */
export interface SimulationProfile {
    label: string;
    device: DeviceReport;
    runtime: RuntimeReport;
    network: NetworkReport;
    integrity: IntegrityReport;
    privacy: PrivacyReport;
}
export declare const SIMULATION_PROFILES: SimulationProfile[];
