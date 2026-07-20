/* eslint-disable no-console */
import {generateReport} from './report/generateReport';
import {ReportFormat, serialize} from './report/writeReport';
import {writeReportToFile} from './report/nodeFs';
import {Region, REGION_LABELS} from './providers/types';
import {SIMULATION_PROFILES} from './simulation';

interface CliOptions {
  region: Region;
  format: ReportFormat;
  profileIndex: number | null;
  outPath?: string;
  print: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
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
        const v = next()?.toUpperCase();
        if (v !== 'MOLDOVA' && v !== 'MACEDONIA') {
          fail(`Invalid --region "${v}". Use MOLDOVA or MACEDONIA.`);
        }
        opts.region = v as Region;
        break;
      }
      case '--format':
      case '-f': {
        const v = next()?.toLowerCase();
        if (v !== 'csv' && v !== 'md') {
          fail(`Invalid --format "${v}". Use csv or md.`);
        }
        opts.format = v as ReportFormat;
        break;
      }
      case '--profile':
      case '-p': {
        const v = Number(next());
        if (Number.isNaN(v) || v < 0 || v >= SIMULATION_PROFILES.length) {
          fail(
            `Invalid --profile. Use 0..${SIMULATION_PROFILES.length - 1} ` +
              `(${SIMULATION_PROFILES.map((p, idx) => `${idx}=${p.label}`).join(', ')}).`,
          );
        }
        opts.profileIndex = v;
        break;
      }
      case '--live':
      case '-l':
        opts.profileIndex = null;
        break;
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

function fail(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function printHelp(): void {
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
  -l, --live                         Scan the REAL device instead of a profile
                                       (uses native module / on-device libs)
  -o, --out <path>                   Output file path (default: auto-named in CWD)
      --print                        Also print the report to stdout
  -h, --help                         Show this help
`);
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));

  const report = await generateReport({
    region: opts.region,
    ...(opts.profileIndex === null
      ? {}
      : {profileIndex: opts.profileIndex}),
  });

  const written = writeReportToFile(report, opts.format, opts.outPath);

  if (opts.print) {
    console.log('\n' + serialize(report, opts.format));
  }

  console.log(`\nSecurityKit report`);
  console.log(`  Region:      ${REGION_LABELS[report.region]}`);
  console.log(`  Profile:     ${report.profileLabel}`);
  console.log(`  Engine:      ${report.mode}`);
  console.log(`  Trust score: ${report.assessment.score}/100 (${report.assessment.level})`);
  console.log(`  Threats:     ${report.assessment.threats.length}`);
  console.log(`  Written to:  ${written}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
