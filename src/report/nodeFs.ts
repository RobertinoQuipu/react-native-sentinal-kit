/**
 * Node-only file writer. This module is intentionally NOT exported from the
 * package's main entry so React Native's Metro bundler never tries to resolve
 * `fs`/`path`. It is used only by the CLI (`src/cli.ts`).
 *
 * In React Native, use `serialize(report, format)` and persist the string with
 * your storage library (react-native-fs / expo-file-system).
 */
import fs from 'fs';
import path from 'path';
import {FullReport} from './generateReport';
import {defaultFileName, ReportFormat, serialize} from './writeReport';

/** Writes the report to disk and returns the absolute path written. */
export function writeReportToFile(
  report: FullReport,
  format: ReportFormat,
  outPath?: string,
): string {
  const target =
    outPath ?? path.resolve(process.cwd(), defaultFileName(report, format));
  fs.writeFileSync(target, serialize(report, format), 'utf8');
  return target;
}
