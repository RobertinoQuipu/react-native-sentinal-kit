"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeReportToFile = exports.defaultFileName = exports.serialize = void 0;
const toCsv_1 = require("./toCsv");
const toMarkdown_1 = require("./toMarkdown");
function serialize(report, format) {
    return format === 'csv' ? (0, toCsv_1.toCsv)(report) : (0, toMarkdown_1.toMarkdown)(report);
}
exports.serialize = serialize;
function defaultFileName(report, format) {
    const stamp = report.generatedAt.replace(/[:.]/g, '-');
    return `securitykit-${report.region.toLowerCase()}-${stamp}.${format}`;
}
exports.defaultFileName = defaultFileName;
/**
 * Writes the report to disk in a Node environment. In React Native there is no
 * `fs`; use `serialize()` and persist the string with your storage library
 * (e.g. react-native-fs / expo-file-system) instead.
 *
 * Returns the absolute path written.
 */
function writeReportToFile(report, format, outPath) {
    // Lazily require so bundlers for React Native don't try to include `fs`.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    const target = outPath !== null && outPath !== void 0 ? outPath : path.resolve(process.cwd(), defaultFileName(report, format));
    fs.writeFileSync(target, serialize(report, format), 'utf8');
    return target;
}
exports.writeReportToFile = writeReportToFile;
