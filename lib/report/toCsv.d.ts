import { FullReport } from './generateReport';
/**
 * Serializes a report to CSV. Includes a metadata preamble (commented with #)
 * followed by the header row and one row per check.
 */
export declare function toCsv(report: FullReport): string;
