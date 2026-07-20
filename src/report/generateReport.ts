import SecurityKit from '../SecurityKit';
import {assessRegion, RegionAssessment} from '../providers/registry';
import {Region} from '../providers/types';
import {SecurityReport} from '../types';

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
export async function generateReport(options: {
  region: Region;
  profileIndex?: number;
}): Promise<FullReport> {
  const profileIndex = options.profileIndex ?? 0;
  SecurityKit.setSimulationProfile(profileIndex);

  const base = await SecurityKit.scan();
  const assessment = await assessRegion(options.region, base, profileIndex);

  const profiles = SecurityKit.getSimulationProfiles();
  const profileLabel =
    profiles[Math.min(profileIndex, profiles.length - 1)]?.label ?? 'unknown';

  return {
    generatedAt: new Date().toISOString(),
    region: options.region,
    profileIndex,
    profileLabel,
    usingNativeModule: SecurityKit.usingNativeModule,
    base,
    assessment,
  };
}
