import {NativeModules, Platform} from './platform';
import {ThreatScore} from './ThreatScore';
import {SIMULATION_PROFILES, SimulationProfile} from './simulation';
import {collectLiveReport, hasLiveSignals} from './deviceCollector';
import {SecurityReport, Spec} from './types';

const LINKING_ERROR =
  `The native module 'SecurityKit' is not linked. ` +
  Platform.select({ios: "Did you run 'pod install'?", default: ''});

/**
 * The native module, if present. In this demo it is intentionally optional:
 * when it is missing we fall back to the JS simulation engine so the app
 * runs on any device/simulator without a custom native build.
 */
const NativeSecurityKit: Partial<Spec> | undefined =
  NativeModules.SecurityKit;

export const isNativeModuleAvailable = (): boolean =>
  NativeSecurityKit != null && typeof NativeSecurityKit.scan === 'function';

export type ScanMode = 'native' | 'live' | 'simulated';

/**
 * SecurityKit is the single public entry point of the SDK.
 * It composes the per-domain reports and computes an aggregate risk score.
 */
class SecurityKitImpl {
  private activeProfile: SimulationProfile = SIMULATION_PROFILES[0];
  private forceSimulation = false;
  private lastMode: ScanMode = 'simulated';

  /**
   * Demo helper: pick which simulated device profile the scan reflects.
   * Setting a profile forces simulation mode (used by the CLI/demo). Pass
   * `null` to return to automatic live/native detection.
   */
  setSimulationProfile(index: number | null): void {
    if (index === null) {
      this.forceSimulation = false;
      return;
    }
    const clamped = Math.max(
      0,
      Math.min(SIMULATION_PROFILES.length - 1, index),
    );
    this.activeProfile = SIMULATION_PROFILES[clamped];
    this.forceSimulation = true;
  }

  getSimulationProfiles(): SimulationProfile[] {
    return SIMULATION_PROFILES;
  }

  get usingNativeModule(): boolean {
    return isNativeModuleAvailable();
  }

  /** How the most recent scan obtained its base data. */
  get mode(): ScanMode {
    return this.lastMode;
  }

  /** True when real on-device detection libraries (e.g. jail-monkey) are linked. */
  get hasLiveSignals(): boolean {
    return hasLiveSignals();
  }

  /**
   * Run a full security scan and return an aggregated report.
   *
   * Resolution order:
   *   1. Native SecurityKit module, if linked.
   *   2. Live on-device signals (jail-monkey / device-info), if available
   *      and simulation is not forced.
   *   3. Simulated device profile (demo / Node fallback).
   */
  async scan(): Promise<SecurityReport> {
    if (isNativeModuleAvailable()) {
      this.lastMode = 'native';
      return NativeSecurityKit!.scan!();
    }

    if (!this.forceSimulation && hasLiveSignals()) {
      this.lastMode = 'live';
      return collectLiveReport();
    }

    // Simulated fallback (adds a little latency for UI scanning states).
    this.lastMode = 'simulated';
    await delay(300);

    const {device, runtime, network, integrity, privacy} = this.activeProfile;
    const partial = {device, runtime, network, integrity, privacy};
    const risk = ThreatScore.calculate(partial);

    return {...partial, risk};
  }

  async getRiskScore(): Promise<number> {
    if (
      NativeSecurityKit &&
      typeof NativeSecurityKit.getRiskScore === 'function'
    ) {
      return NativeSecurityKit.getRiskScore();
    }
    return (await this.scan()).risk.score;
  }

  isRooted = () => this.field(r => r.device.rooted);
  isJailbroken = () => this.field(r => r.device.jailbroken);
  isEmulator = () => this.field(r => r.device.emulator || r.device.simulator);
  isDeveloperMode = () => this.field(r => r.device.developerMode);
  isUsbDebuggingEnabled = () => this.field(r => r.device.usbDebugging);
  isDebuggerAttached = () => this.field(r => r.runtime.debuggerAttached);
  isVpnEnabled = () => this.field(r => r.network.vpn);
  isProxyEnabled = () => this.field(r => r.network.proxy);
  isScreenCaptured = () => this.field(r => r.privacy.screenRecording);

  private async field(
    selector: (r: SecurityReport) => boolean,
  ): Promise<boolean> {
    return selector(await this.scan());
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const isDev =
  typeof __DEV__ !== 'undefined'
    ? __DEV__
    : process?.env?.NODE_ENV !== 'production';

if (!isNativeModuleAvailable() && isDev) {
  // eslint-disable-next-line no-console
  console.info(
    `[SecurityKit] ${LINKING_ERROR} Falling back to JS simulation engine.`,
  );
}

const SecurityKit = new SecurityKitImpl();
export default SecurityKit;
