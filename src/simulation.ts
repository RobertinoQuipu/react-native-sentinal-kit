import {Platform} from './platform';
import {
  DeviceReport,
  IntegrityReport,
  NetworkReport,
  PrivacyReport,
  RemoteAccessReport,
  RuntimeReport,
} from './types';

/**
 * A deterministic-ish simulated signal source used when the native module
 * is not linked (e.g. running the JS-only demo, tests, or web).
 *
 * A real build replaces this by wiring SecurityKitModule (Kotlin/Swift)
 * through NativeModules. The public API stays identical.
 */
export interface SimulationProfile {
  label: string;
  device: DeviceReport;
  runtime: RuntimeReport;
  network: NetworkReport;
  integrity: IntegrityReport;
  privacy: PrivacyReport;
  remoteAccess: RemoteAccessReport;
}

const isIOS = Platform.OS === 'ios';

export const SIMULATION_PROFILES: SimulationProfile[] = [
  {
    label: 'Clean device',
    device: {
      rooted: false,
      jailbroken: false,
      emulator: false,
      simulator: false,
      developerMode: false,
      usbDebugging: false,
    },
    runtime: {
      debuggerAttached: false,
      fridaDetected: false,
      xposedDetected: false,
      magiskDetected: false,
      hookDetected: false,
      suspiciousLibraries: [],
    },
    network: {vpn: false, proxy: false, dnsChanged: false, certificatePinned: true},
    integrity: {
      playIntegrity: true,
      appAttest: true,
      signatureValid: true,
      bundleHashValid: true,
    },
    privacy: {
      screenshotBlocked: true,
      screenRecording: false,
      overlayDetected: false,
    },
    remoteAccess: {
      remoteAccessApps: [],
      overlayDetected: false,
      accessibilityRisk: false,
      screenCaptured: false,
      debuggerAttached: false,
    },
  },
  {
    label: 'Developer / emulator',
    device: {
      rooted: false,
      jailbroken: false,
      emulator: !isIOS,
      simulator: isIOS,
      developerMode: true,
      usbDebugging: !isIOS,
    },
    runtime: {
      debuggerAttached: true,
      fridaDetected: false,
      xposedDetected: false,
      magiskDetected: false,
      hookDetected: false,
      suspiciousLibraries: [],
    },
    network: {vpn: true, proxy: false, dnsChanged: false, certificatePinned: true},
    integrity: {
      playIntegrity: false,
      appAttest: false,
      signatureValid: true,
      bundleHashValid: true,
    },
    privacy: {
      screenshotBlocked: false,
      screenRecording: false,
      overlayDetected: false,
    },
    remoteAccess: {
      remoteAccessApps: [
        {
          name: 'TeamViewer QuickSupport',
          installed: true,
          active: false,
          confidence: 0.85,
        },
      ],
      overlayDetected: false,
      accessibilityRisk: false,
      screenCaptured: false,
      debuggerAttached: true,
    },
  },
  {
    label: 'Compromised device',
    device: {
      rooted: !isIOS,
      jailbroken: isIOS,
      emulator: false,
      simulator: false,
      developerMode: true,
      usbDebugging: !isIOS,
    },
    runtime: {
      debuggerAttached: true,
      fridaDetected: true,
      xposedDetected: !isIOS,
      magiskDetected: !isIOS,
      hookDetected: true,
      suspiciousLibraries: isIOS
        ? ['MobileSubstrate.dylib']
        : ['frida-agent.so', 'libriru.so'],
    },
    network: {vpn: true, proxy: true, dnsChanged: true, certificatePinned: false},
    integrity: {
      playIntegrity: false,
      appAttest: false,
      signatureValid: false,
      bundleHashValid: false,
    },
    privacy: {
      screenshotBlocked: false,
      screenRecording: true,
      overlayDetected: true,
    },
    remoteAccess: {
      remoteAccessApps: [
        {
          name: 'AnyDesk',
          installed: true,
          active: true,
          confidence: 0.95,
        },
        {
          name: 'TeamViewer QuickSupport',
          installed: true,
          active: false,
          confidence: 0.85,
        },
      ],
      overlayDetected: true,
      accessibilityRisk: true,
      screenCaptured: true,
      debuggerAttached: true,
    },
  },
];
