import { FullReport } from './generateReport';
import { ReportFormat } from './writeReport';
/** Writes the report to disk and returns the absolute path written. */
export declare function writeReportToFile(report: FullReport, format: ReportFormat, outPath?: string): string;
