"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMarkdown = void 0;
const types_1 = require("../providers/types");
const rows_1 = require("./rows");
function statusIcon(status) {
    return status === 'FLAGGED' ? '🔴 FLAGGED' : '🟢 CLEAR';
}
/**
 * Serializes a report to Markdown with a summary, threats list, and a grouped
 * table of every check.
 */
function toMarkdown(report) {
    const { assessment } = report;
    const rows = (0, rows_1.allRows)(report);
    const lines = [];
    lines.push(`# SecurityKit Report`);
    lines.push('');
    lines.push(`- **Generated:** ${report.generatedAt}`);
    lines.push(`- **Region:** ${types_1.REGION_LABELS[report.region]}`);
    lines.push(`- **Profile:** ${report.profileLabel}`);
    lines.push(`- **Engine:** ${report.usingNativeModule ? 'native SDK' : 'simulated'}`);
    lines.push(`- **Trust score:** ${assessment.score} / 100`);
    lines.push(`- **Risk level:** ${assessment.level}`);
    lines.push('');
    lines.push(`## Providers`);
    lines.push('');
    lines.push(`| Provider | Backing | Flagged signals |`);
    lines.push(`| --- | --- | --- |`);
    for (const p of assessment.providers) {
        const flagged = p.signals.filter(s => s.flagged).length;
        lines.push(`| ${p.name} | ${p.native ? 'native SDK' : 'simulated'} | ${flagged} |`);
    }
    lines.push('');
    lines.push(`## Active threats (${assessment.threats.length})`);
    lines.push('');
    if (assessment.threats.length === 0) {
        lines.push(`_No threats detected._`);
    }
    else {
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
        lines.push(`| ${r.category} | ${r.check} | ${statusIcon(r.status)} | ${detail} |`);
    }
    lines.push('');
    return lines.join('\n');
}
exports.toMarkdown = toMarkdown;
