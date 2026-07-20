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
