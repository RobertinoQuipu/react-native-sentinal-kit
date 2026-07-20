import {REGION_LABELS} from '../providers/types';
import {FullReport} from './generateReport';
import {allRows, Row} from './rows';

function statusIcon(status: Row['status']): string {
  return status === 'FLAGGED' ? '🔴 FLAGGED' : '🟢 CLEAR';
}

/**
 * Serializes a report to Markdown with a summary, threats list, and a grouped
 * table of every check.
 */
export function toMarkdown(report: FullReport): string {
  const {assessment} = report;
  const rows = allRows(report);

  const lines: string[] = [];
  lines.push(`# SecurityKit Report`);
  lines.push('');
  lines.push(`- **Generated:** ${report.generatedAt}`);
  lines.push(`- **Region:** ${REGION_LABELS[report.region]}`);
  lines.push(`- **Profile:** ${report.profileLabel}`);
  lines.push(`- **Engine:** ${report.mode}`);
  lines.push(`- **Trust score:** ${assessment.score} / 100`);
  lines.push(`- **Risk level:** ${assessment.level}`);
  lines.push('');

  lines.push(`## Providers`);
  lines.push('');
  lines.push(`| Provider | Backing | Flagged signals |`);
  lines.push(`| --- | --- | --- |`);
  for (const p of assessment.providers) {
    const flagged = p.signals.filter(s => s.flagged).length;
    lines.push(
      `| ${p.name} | ${p.native ? 'native SDK' : 'simulated'} | ${flagged} |`,
    );
  }
  lines.push('');

  lines.push(`## Active threats (${assessment.threats.length})`);
  lines.push('');
  if (assessment.threats.length === 0) {
    lines.push(`_No threats detected._`);
  } else {
    for (const t of assessment.threats) {
      lines.push(`- ${t}`);
    }
  }
  lines.push('');

  lines.push(`## Detailed checks`);
  lines.push('');
  lines.push(`| Category | Check | Status | Detail |`);
  lines.push(`| --- | --- | --- | --- |`);
  for (const r of rows) {
    const detail = r.detail.replace(/\|/g, '\\|');
    lines.push(
      `| ${r.category} | ${r.check} | ${statusIcon(r.status)} | ${detail} |`,
    );
  }
  lines.push('');

  return lines.join('\n');
}
