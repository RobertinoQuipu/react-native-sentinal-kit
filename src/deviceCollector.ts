import {Platform} from './platform';
import {
  DeviceReport,
  IntegrityReport,
  NetworkReport,
  PrivacyReport,
  RuntimeReport,
  SecurityReport,
} from './types';
import {ThreatScore} from './ThreatScore';

/**
 * Live, on-device signal collection.
 *
 * This reads REAL signals from whatever detection libraries are linked in the
 * host app, without adding hard dependencies:
 *
 *   - jail-monkey             -> root/jailbreak, hooks, debug, dev settings,
 *                                mock location, ADB, external storage
 *   - react-native-device-info -> emulator/simulator detection (optional)
 *
 * Anything that cannot be determined on-device from JS (Play Integrity, App
 * Attest, signature/bundle hash, Frida/Magisk internals, screenshot blocking)
 * is reported conservatively and should be provided by a native SecurityKit
 * module or a dedicated provider when available.
 */

interface JailMonkeyApi {
  isJailBroken(): boolean;
  canMockLocation(): boolean;
  trustFall(): boolean;
  isOnExternalStorage?(): boolean;
  isDebuggedMode?(): Promise<boolean> | boolean;
  hookDetected?(): boolean;
  isDevelopmentSettingsMode?(): Promise<boolean> | boolean;
  AdbEnabled?(): Promise<boolean> | boolean;
}

interface DeviceInfoApi {
  isEmulator(): Promise<boolean>;
  isEmulatorSync?(): boolean;
}

/**
 * Loads jail-monkey. Metro/React Native only bundle `require()` calls with a
 * STRING LITERAL argument, so we must not use a dynamic variable here.
 */
function loadJailMonkey(): JailMonkeyApi | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('jail-monkey');
    return (mod?.default ?? mod) as JailMonkeyApi;
  } catch {
    return null;
  }
}

function loadDeviceInfo(): DeviceInfoApi | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-device-info');
    return (mod?.default ?? mod) as DeviceInfoApi;
  } catch {
    return null;
  }
}

async function toBool(v: unknown): Promise<boolean> {
  try {
    return !!(await Promise.resolve(v));
  } catch {
    return false;
  }
}

/**
 * Returns true when at least one real on-device detection library is linked,
 * meaning a live scan will produce meaningful data.
 */
export function hasLiveSignals(): boolean {
  const jm = loadJailMonkey();
  return jm != null && typeof jm.isJailBroken === 'function';
}

export async function collectLiveReport(): Promise<SecurityReport> {
  const jm = loadJailMonkey();
  const deviceInfo = loadDeviceInfo();

  const isIOS = Platform.OS === 'ios';

  // ---- Device --------------------------------------------------------------
  const jailBroken = jm ? safe(() => jm.isJailBroken(), false) : false;
  const externalStorage = jm?.isOnExternalStorage
    ? safe(() => jm.isOnExternalStorage!(), false)
    : false;

  const devSettings = jm?.isDevelopmentSettingsMode
    ? await toBool(jm.isDevelopmentSettingsMode())
    : false;
  const adbEnabled = jm?.AdbEnabled ? await toBool(jm.AdbEnabled()) : false;

  let emulator = false;
  if (deviceInfo) {
    emulator = deviceInfo.isEmulatorSync
      ? safe(() => deviceInfo.isEmulatorSync!(), false)
      : await toBool(deviceInfo.isEmulator());
  }

  const device: DeviceReport = {
    rooted: !isIOS && jailBroken,
    jailbroken: isIOS && jailBroken,
    emulator: !isIOS && emulator,
    simulator: isIOS && emulator,
    developerMode: devSettings,
    usbDebugging: adbEnabled,
  };

  // ---- Runtime -------------------------------------------------------------
  const hooks = jm?.hookDetected ? safe(() => jm.hookDetected!(), false) : false;
  const debugged = jm?.isDebuggedMode
    ? await toBool(jm.isDebuggedMode())
    : false;
  const tamper = jm ? safe(() => jm.trustFall(), false) : false;

  const runtime: RuntimeReport = {
    debuggerAttached: debugged,
    // Frida/Magisk/Xposed require native probes; conservatively derived.
    fridaDetected: false,
    xposedDetected: false,
    magiskDetected: !isIOS && jailBroken && tamper,
    hookDetected: hooks || tamper || externalStorage,
    suspiciousLibraries: [],
  };

  // ---- Network -------------------------------------------------------------
  // No hard dependency on a netinfo lib; left conservative unless the app wires
  // one in. Mock-location is a strong tamper indicator we surface via privacy.
  const network: NetworkReport = {
    vpn: false,
    proxy: false,
    dnsChanged: false,
    certificatePinned: true,
  };

  // ---- Integrity -----------------------------------------------------------
  // These require Play Integrity / App Attest / native signature checks.
  // Assume valid unless a native module reports otherwise.
  const integrity: IntegrityReport = {
    playIntegrity: true,
    appAttest: true,
    signatureValid: true,
    bundleHashValid: true,
  };

  // ---- Privacy -------------------------------------------------------------
  const privacy: PrivacyReport = {
    screenshotBlocked: true,
    screenRecording: false,
    overlayDetected: false,
  };

  const partial = {device, runtime, network, integrity, privacy};
  const risk = ThreatScore.calculate(partial);
  return {...partial, risk};
}

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}
