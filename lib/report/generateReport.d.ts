import { RegionAssessment } from '../providers/registry';
import { Region } from '../providers/types';
import { SecurityReport } from '../types';
export interface FullReport {
    generatedAt: string;
    region: Region;
    profileIndex: number;
    profileLabel: string;
    usingNativeModule: boolean;
    base: SecurityReport;
    assessment: RegionAssessment;
}
/**
 * Runs a complete scan for a region and returns an aggregated report object.
 * Works both inside React Native (native SDKs when linked) and in Node
 * (JS simulation engine).
 */
export declare function generateReport(options: {
    region: Region;
    profileIndex?: number;
}): Promise<FullReport>;
