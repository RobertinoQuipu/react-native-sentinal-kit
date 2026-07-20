import { ProviderResult, Region } from './types';
import { RiskLevel, SecurityReport } from '../types';
export interface RegionAssessment {
    region: Region;
    providers: ProviderResult[];
    score: number;
    level: RiskLevel;
    threats: string[];
}
/**
 * Runs all providers configured for `region`, then aggregates their signals
 * into a single trust score (100 down to 0) and severity level.
 */
export declare function assessRegion(region: Region, base: SecurityReport, profileIndex: number): Promise<RegionAssessment>;
