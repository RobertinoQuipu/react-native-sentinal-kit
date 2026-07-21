import { SecurityReport } from '../types';
/**
 * A Region determines which threat-intelligence providers are engaged.
 *
 * - Moldova   -> LexisNexis (ThreatMetrix) + JailMonkey
 * - Macedonia -> IBM Trusteer + JailMonkey
 *
 * JailMonkey runs in both regions as the on-device baseline.
 */
export type Region = 'MOLDOVA' | 'MACEDONIA';
export type ProviderId = 'jailmonkey' | 'lexisnexis' | 'trusteer';
/**
 * A single signal contributed by a provider. `flagged` means the provider
 * considers this a risk. `weight` is the score penalty applied by the engine.
 */
export interface ProviderSignal {
    key: string;
    label: string;
    flagged: boolean;
    weight: number;
    detail?: string;
}
/** Shared helper to build a ProviderSignal. */
export declare function signal(key: string, label: string, flagged: boolean, weight: number, detail?: string): ProviderSignal;
export interface ProviderResult {
    id: ProviderId;
    name: string;
    /** True when backed by a real linked native SDK; false when simulated. */
    native: boolean;
    signals: ProviderSignal[];
}
/**
 * A SecurityProvider is a pluggable threat-intelligence source. Each provider
 * inspects the current environment (and optionally the base SecurityReport)
 * and returns a normalized set of signals.
 */
export interface SecurityProvider {
    id: ProviderId;
    name: string;
    /** Regions this provider is licensed / configured for. */
    regions: Region[];
    evaluate(context: ProviderContext): Promise<ProviderResult>;
}
export interface ProviderContext {
    region: Region;
    /** The base on-device report from the core SecurityKit scan. */
    base: SecurityReport;
}
export declare const REGION_PROVIDERS: Record<Region, ProviderId[]>;
export declare const REGION_LABELS: Record<Region, string>;
