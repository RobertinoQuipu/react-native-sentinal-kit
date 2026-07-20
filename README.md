# react-native-security-kit

Layered device-security scanning for React Native with **region-specific
threat-intelligence providers**. No UI — it runs a scan and outputs a
**report** (Markdown or CSV) locally, or returns structured data you can use
in code.

## Providers & regions

| Region | Providers engaged |
| --- | --- |
| 🇲🇩 **Moldova** | **LexisNexis ThreatMetrix** + **JailMonkey** |
| 🇲🇰 **North Macedonia** | **IBM Trusteer** + **JailMonkey** |

- **JailMonkey** — on-device root/jailbreak/tamper baseline (both regions).
  Uses the real [`jail-monkey`](https://www.npmjs.com/package/jail-monkey)
  library when linked; otherwise simulated.
- **LexisNexis ThreatMetrix** (Moldova) — adapter for the TMX Mobile SDK
  (native module `LexisNexisThreatMetrix`).
- **IBM Trusteer** (Macedonia) — adapter for the Trusteer Mobile SDK
  (native module `IBMTrusteer`). Modeled on IBM's published multilayer
  taxonomy — see https://www.ibm.com/products/trusteer.

When a commercial native module is not linked, its decision is **simulated**
from the on-device signals, so the package runs anywhere (including plain
Node). Each provider result records whether it was `native` or `simulated`.

## Install (as a dependency)

```sh
yarn add react-native-security-kit
# optional on-device baseline:
yarn add jail-monkey
```

## Programmatic use (in an app)

```ts
import {generateReport, serialize} from 'react-native-security-kit';

const report = await generateReport({region: 'MOLDOVA', profileIndex: 0});

console.log(report.assessment.score, report.assessment.level);

// Get the report as a string and persist it with your storage lib
// (react-native-fs / expo-file-system):
const md = serialize(report, 'md');
const csv = serialize(report, 'csv');
```

`generateReport` returns a `FullReport` with the base scan, the region
assessment (score, level, threats), and per-provider signals.

> `writeReportToFile()` uses Node's `fs` and is intended for the CLI / Node.
> In React Native, use `serialize()` + your file library.

## CLI — generate a local report file

From this repo (no publish needed):

```sh
yarn install
yarn report --region MACEDONIA --profile 2 --format md --out ./report.md
yarn report -r MOLDOVA -p 1 -f csv           # auto-named file in CWD
```

Or after building / installing the package, use the bundled bin:

```sh
yarn build
node lib/cli.js --region MOLDOVA --format csv --print
# or, when installed as a dependency:
npx securitykit-report -r MACEDONIA -f md
```

### CLI options

```
-r, --region <MOLDOVA|MACEDONIA>   Provider set (default: MOLDOVA)
-f, --format <csv|md>              Output format (default: md)
-p, --profile <0|1|2>              Simulated device profile
                                     0 = Clean, 1 = Developer/emulator, 2 = Compromised
-o, --out <path>                   Output path (default: auto-named in CWD)
    --print                        Also print the report to stdout
-h, --help                         Show help
```

Example output (`report.md`) includes: summary (score/level/engine), a
providers table, an active-threats list, and a full per-check table. CSV output
has a `#`-commented metadata preamble followed by `Category,Check,Status,Detail`
rows.

## Wiring the real native SDKs

1. **JailMonkey** — `yarn add jail-monkey`; auto-detected.
2. **ThreatMetrix (Moldova)** — expose native module `LexisNexisThreatMetrix`
   implementing `profile({orgId, sessionId})` (see `src/providers/LexisNexisProvider.ts`).
3. **Trusteer (Macedonia)** — expose native module `IBMTrusteer`
   implementing `assess({customerId})` (see `src/providers/IBMTrusteerProvider.ts`).

## Scripts

```sh
yarn typecheck   # tsc --noEmit
yarn build       # compile to lib/ (+ executable bin shebang)
yarn report ...  # run the CLI via tsx
```

## Project structure

```
src/
  index.ts                 Public exports
  cli.ts                   Report CLI entry (bin: securitykit-report)
  platform.ts              react-native ⇆ Node shim
  SecurityKit.ts           Core scan orchestrator
  ThreatScore.ts           Score aggregation
  types.ts, constants.ts   Shared types & weights
  simulation.ts            Simulated device profiles
  providers/               JailMonkey / LexisNexis / Trusteer + registry
  report/                  generateReport, toCsv, toMarkdown, writeReport
```
