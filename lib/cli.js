#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const generateReport_1 = require("./report/generateReport");
const writeReport_1 = require("./report/writeReport");
const types_1 = require("./providers/types");
const simulation_1 = require("./simulation");
function parseArgs(argv) {
    var _a, _b;
    const opts = {
        region: 'MOLDOVA',
        format: 'md',
        profileIndex: 0,
        print: false,
    };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        const next = () => argv[++i];
        switch (arg) {
            case '--region':
            case '-r': {
                const v = (_a = next()) === null || _a === void 0 ? void 0 : _a.toUpperCase();
                if (v !== 'MOLDOVA' && v !== 'MACEDONIA') {
                    fail(`Invalid --region "${v}". Use MOLDOVA or MACEDONIA.`);
                }
                opts.region = v;
                break;
            }
            case '--format':
            case '-f': {
                const v = (_b = next()) === null || _b === void 0 ? void 0 : _b.toLowerCase();
                if (v !== 'csv' && v !== 'md') {
                    fail(`Invalid --format "${v}". Use csv or md.`);
                }
                opts.format = v;
                break;
            }
            case '--profile':
            case '-p': {
                const v = Number(next());
                if (Number.isNaN(v) || v < 0 || v >= simulation_1.SIMULATION_PROFILES.length) {
                    fail(`Invalid --profile. Use 0..${simulation_1.SIMULATION_PROFILES.length - 1} ` +
                        `(${simulation_1.SIMULATION_PROFILES.map((p, idx) => `${idx}=${p.label}`).join(', ')}).`);
                }
                opts.profileIndex = v;
                break;
            }
            case '--out':
            case '-o':
                opts.outPath = next();
                break;
            case '--print':
                opts.print = true;
                break;
            case '--help':
            case '-h':
                printHelp();
                process.exit(0);
                break;
            default:
                fail(`Unknown argument "${arg}". Use --help.`);
        }
    }
    return opts;
}
function fail(message) {
    console.error(`Error: ${message}`);
    process.exit(1);
}
function printHelp() {
    console.log(`
SecurityKit report generator

Usage:
  securitykit-report [options]

Options:
  -r, --region <MOLDOVA|MACEDONIA>   Region / provider set (default: MOLDOVA)
                                       MOLDOVA   = LexisNexis ThreatMetrix + JailMonkey
                                       MACEDONIA = IBM Trusteer + JailMonkey
  -f, --format <csv|md>              Output format (default: md)
  -p, --profile <0|1|2>              Simulated device profile (default: 0)
                                       0 = Clean device
                                       1 = Developer / emulator
                                       2 = Compromised device
  -o, --out <path>                   Output file path (default: auto-named in CWD)
      --print                        Also print the report to stdout
  -h, --help                         Show this help
`);
}
async function main() {
    const opts = parseArgs(process.argv.slice(2));
    const report = await (0, generateReport_1.generateReport)({
        region: opts.region,
        profileIndex: opts.profileIndex,
    });
    const written = (0, writeReport_1.writeReportToFile)(report, opts.format, opts.outPath);
    if (opts.print) {
        console.log('\n' + (0, writeReport_1.serialize)(report, opts.format));
    }
    console.log(`\nSecurityKit report`);
    console.log(`  Region:      ${types_1.REGION_LABELS[report.region]}`);
    console.log(`  Profile:     ${report.profileLabel}`);
    console.log(`  Engine:      ${report.usingNativeModule ? 'native' : 'simulated'}`);
    console.log(`  Trust score: ${report.assessment.score}/100 (${report.assessment.level})`);
    console.log(`  Threats:     ${report.assessment.threats.length}`);
    console.log(`  Written to:  ${written}\n`);
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
