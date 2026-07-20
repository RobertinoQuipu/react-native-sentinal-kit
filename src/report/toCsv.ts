import {FullReport} from './generateReport';
import {allRows} from './rows';

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Serializes a report to CSV. Includes a metadata preamble (commented with #)
 * followed by the header row and one row per check.
 */
export function toCsv(report: FullReport): string {
  const meta = [
    `# SecurityKit Report`,
    `# generatedAt,${report.generatedAt}`,
    `# region,${report.region}`,
    `# profile,${report.profileLabel}`,
    `# engine,${report.mode}`,
    `# trustScore,${report.assessment.score}`,
    `# riskLevel,${report.assessment.level}`,
    `# activeThreats,${report.assessment.threats.length}`,
  ].join('\n');

  const header = ['Category', 'Check', 'Status', 'Detail']
    .map(escapeCsv)
    .join(',');

  const body = allRows(report)
    .map(r =>
      [r.category, r.check, r.status, r.detail].map(escapeCsv).join(','),
    )
    .join('\n');

  return `${meta}\n${header}\n${body}\n`;
}
