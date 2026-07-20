"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCsv = void 0;
const rows_1 = require("./rows");
function escapeCsv(value) {
    if (/[",\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}
/**
 * Serializes a report to CSV. Includes a metadata preamble (commented with #)
 * followed by the header row and one row per check.
 */
function toCsv(report) {
    const meta = [
        `# SecurityKit Report`,
        `# generatedAt,${report.generatedAt}`,
        `# region,${report.region}`,
        `# profile,${report.profileLabel}`,
        `# engine,${report.usingNativeModule ? 'native' : 'simulated'}`,
        `# trustScore,${report.assessment.score}`,
        `# riskLevel,${report.assessment.level}`,
        `# activeThreats,${report.assessment.threats.length}`,
    ].join('\n');
    const header = ['Category', 'Check', 'Status', 'Detail']
        .map(escapeCsv)
        .join(',');
    const body = (0, rows_1.allRows)(report)
        .map(r => [r.category, r.check, r.status, r.detail].map(escapeCsv).join(','))
        .join('\n');
    return `${meta}\n${header}\n${body}\n`;
}
exports.toCsv = toCsv;
