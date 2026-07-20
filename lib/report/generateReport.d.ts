import { ScanMode } from '../SecurityKit';
import { RegionAssessment } from '../providers/registry';
import { Region } from '../providers/types';
import { SecurityReport } from '../types';
export interface FullReport {
    generatedAt: string;
    region: Region;
    /** -1 when scanning a real device; 0..N when a simulation profile is used. */
    profileIndex: number;
    profileLabel: string;
    usingNativeModule: boolean;
    mode: ScanMode;
    base: SecurityReport;
    assessment: RegionAssessment;
}
/**
 * Runs a complete scan for a region and returns an aggregated report object.
 *
 * - Omit `profileIndex` to scan the REAL device (native module or live
 *   on-device signals such as jail-monkey). This is what apps should use.
 * - Pass `profileIndex` (0..N) to force a simulated device profile, used by
 *   the demo CLI and for testing.
 */
export declare function generateReport(options: {
    region: Region;
    profileIndex?: number;
}): Promise<FullReport>;
