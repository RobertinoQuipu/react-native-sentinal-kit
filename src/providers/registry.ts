import {IBMTrusteerProvider} from './IBMTrusteerProvider';
import {JailMonkeyProvider} from './JailMonkeyProvider';
import {LexisNexisProvider} from './LexisNexisProvider';
import {
  ProviderContext,
  ProviderResult,
  Region,
  REGION_PROVIDERS,
  SecurityProvider,
} from './types';
import {RiskLevel, SecurityReport} from '../types';
import {riskLevelForScore} from '../constants';

const REGISTRY: Record<string, SecurityProvider> = {
  jailmonkey: JailMonkeyProvider,
  lexisnexis: LexisNexisProvider,
  trusteer: IBMTrusteerProvider,
};

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
export async function assessRegion(
  region: Region,
  base: SecurityReport,
  profileIndex: number,
): Promise<RegionAssessment> {
  const ids = REGION_PROVIDERS[region];
  const ctx: ProviderContext = {region, base, profileIndex};

  const providers = await Promise.all(
    ids.map(id => REGISTRY[id].evaluate(ctx)),
  );

  let score = 100;
  const threats: string[] = [];

  for (const p of providers) {
    for (const s of p.signals) {
      if (s.flagged) {
        score -= s.weight;
        threats.push(`[${p.name}] ${s.label}`);
      }
    }
  }

  const clamped = Math.max(0, Math.min(100, score));
  return {
    region,
    providers,
    score: clamped,
    level: riskLevelForScore(clamped),
    threats,
  };
}
