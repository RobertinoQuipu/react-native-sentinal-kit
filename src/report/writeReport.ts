import {FullReport} from './generateReport';
import {toCsv} from './toCsv';
import {toMarkdown} from './toMarkdown';

export type ReportFormat = 'csv' | 'md';

export function serialize(report: FullReport, format: ReportFormat): string {
  return format === 'csv' ? toCsv(report) : toMarkdown(report);
}

export function defaultFileName(
  report: FullReport,
  format: ReportFormat,
): string {
  const stamp = report.generatedAt.replace(/[:.]/g, '-');
  return `securitykit-${report.region.toLowerCase()}-${stamp}.${format}`;
}

/**
 * Writes the report to disk in a Node environment. In React Native there is no
 * `fs`; use `serialize()` and persist the string with your storage library
 * (e.g. react-native-fs / expo-file-system) instead.
 *
 * Returns the absolute path written.
 */
export function writeReportToFile(
  report: FullReport,
  format: ReportFormat,
  outPath?: string,
): string {
  // Lazily require so bundlers for React Native don't try to include `fs`.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require('fs');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require('path');

  const target =
    outPath ?? path.resolve(process.cwd(), defaultFileName(report, format));
  fs.writeFileSync(target, serialize(report, format), 'utf8');
  return target;
}
