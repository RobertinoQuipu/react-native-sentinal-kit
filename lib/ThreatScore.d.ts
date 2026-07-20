import { RiskReport, SecurityReport } from './types';
type OmitRisk = Omit<SecurityReport, 'risk'>;
/**
 * ThreatScore turns a set of raw signals into a 0-100 trust score,
 * a severity level, and a list of human-readable threats.
 *
 * The score starts at 100 (fully trusted) and each detected signal
 * subtracts its configured weight.
 */
export declare class ThreatScore {
    static calculate(report: OmitRisk): RiskReport;
}
export {};
