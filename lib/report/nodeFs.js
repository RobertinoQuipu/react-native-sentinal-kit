"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeReportToFile = void 0;
/**
 * Node-only file writer. This module is intentionally NOT exported from the
 * package's main entry so React Native's Metro bundler never tries to resolve
 * `fs`/`path`. It is used only by the CLI (`src/cli.ts`).
 *
 * In React Native, use `serialize(report, format)` and persist the string with
 * your storage library (react-native-fs / expo-file-system).
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const writeReport_1 = require("./writeReport");
/** Writes the report to disk and returns the absolute path written. */
function writeReportToFile(report, format, outPath) {
    const target = outPath !== null && outPath !== void 0 ? outPath : path_1.default.resolve(process.cwd(), (0, writeReport_1.defaultFileName)(report, format));
    fs_1.default.writeFileSync(target, (0, writeReport_1.serialize)(report, format), 'utf8');
    return target;
}
exports.writeReportToFile = writeReportToFile;
