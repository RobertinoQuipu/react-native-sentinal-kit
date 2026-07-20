import { FullReport } from './generateReport';
export type ReportFormat = 'csv' | 'md';
export declare function serialize(report: FullReport, format: ReportFormat): string;
export declare function defaultFileName(report: FullReport, format: ReportFormat): string;
/**
 * Writes the report to disk in a Node environment. In React Native there is no
 * `fs`; use `serialize()` and persist the string with your storage library
 * (e.g. react-native-fs / expo-file-system) instead.
 *
 * Returns the absolute path written.
 */
export declare function writeReportToFile(report: FullReport, format: ReportFormat, outPath?: string): string;
