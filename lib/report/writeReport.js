"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultFileName = exports.serialize = void 0;
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
