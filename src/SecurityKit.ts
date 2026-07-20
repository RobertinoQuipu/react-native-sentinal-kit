import {NativeModules, Platform} from './platform';
import {ThreatScore} from './ThreatScore';
import {SIMULATION_PROFILES, SimulationProfile} from './simulation';
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

/**
 * SecurityKit is the single public entry point of the SDK.
 * It composes the per-domain reports and computes an aggregate risk score.
 */
class SecurityKitImpl {
  private activeProfile: SimulationProfile = SIMULATION_PROFILES[0];

  /** Demo helper: pick which simulated device profile the scan reflects. */
  setSimulationProfile(index: number): void {
    const clamped = Math.max(
      0,
      Math.min(SIMULATION_PROFILES.length - 1, index),
    );
    this.activeProfile = SIMULATION_PROFILES[clamped];
  }

  getSimulationProfiles(): SimulationProfile[] {
    return SIMULATION_PROFILES;
  }

  get usingNativeModule(): boolean {
    return isNativeModuleAvailable();
  }

  /**
   * Run a full security scan and return an aggregated report.
   */
  async scan(): Promise<SecurityReport> {
    if (isNativeModuleAvailable()) {
      // Real native path: the module returns a fully-formed report.
      return NativeSecurityKit!.scan!();
    }

    // Simulated network latency so the UI can show a scanning state.
    await delay(650);

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
