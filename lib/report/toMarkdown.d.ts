import { FullReport } from './generateReport';
/**
 * Serializes a report to Markdown with a summary, threats list, and a grouped
 * table of every check.
 */
export declare function toMarkdown(report: FullReport): string;
