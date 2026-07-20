import { SecurityReport } from './types';
/**
 * Returns true when at least one real on-device detection library is linked,
 * meaning a live scan will produce meaningful data.
 */
export declare function hasLiveSignals(): boolean;
export declare function collectLiveReport(): Promise<SecurityReport>;
