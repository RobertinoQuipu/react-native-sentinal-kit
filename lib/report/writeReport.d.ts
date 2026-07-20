import { FullReport } from './generateReport';
export type ReportFormat = 'csv' | 'md';
export declare function serialize(report: FullReport, format: ReportFormat): string;
export declare function defaultFileName(report: FullReport, format: ReportFormat): string;
