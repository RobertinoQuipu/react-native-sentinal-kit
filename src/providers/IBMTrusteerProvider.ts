import {NativeModules} from '../platform';
import {ProviderContext, ProviderResult, SecurityProvider} from './types';

/**
 * IBM Security Trusteer provider — engaged for the MACEDONIA region.
 *
 * Source: https://www.ibm.com/products/trusteer
 *
 * IBM Trusteer is a family of cloud services + endpoint SDKs that use
 * cloud intelligence, AI and ML to assess risk, detect fraud, establish
 * identity and authenticate users. Product family:
 *   - Trusteer Pinpoint Detect  (account takeover, behavioral biometrics)
 *   - Trusteer Pinpoint Assure  (new/guest identity risk)
 *   - Trusteer Mobile           (real-time device hygiene + session risk)  <-- used here
 *   - Trusteer Rapport          (malware / phishing remediation)
 *
 * Multilayered risk assessment (per IBM): Device, Network, User biometrics,
 * Account data, Global intelligence. The Device layer checks spoofing/
 * abnormalities, malware, emulators, screen overlays and remote access tools;
 * the Network layer checks location, carrier/hosting and VPN usage. A unique
 * persistent device fingerprint spans a network of millions of devices across
 * 190 countries.
 *
 * In production you embed the Trusteer Mobile SDK and expose it to JS via a
 * native module named `IBMTrusteer`.
 *
 * Expected native interface (implement in Kotlin/Swift):
 *   assess(customerId): Promise<{
 *     riskScore: number,            // 0-1000, higher = riskier
 *     deviceFingerprint: string,    // persistent device id
 *     malwareDetected: boolean,
 *     rat: boolean,                 // remote access tool
 *     emulator: boolean,
 *     rooted: boolean,
 *     overlayDetected: boolean,
 *     vpn: boolean,
 *     callInProgress: boolean,      // social-engineering signal
 *     recommendations: string[],
 *   }>
 *
 * Falls back to a synthesized assessment from the base report when the native
 * module is not linked.
 */

interface TrusteerNativeModule {
  assess(config: {customerId: string}): Promise<{
    riskScore: number;
    deviceFingerprint: string;
    malwareDetected: boolean;
    rat: boolean;
    emulator: boolean;
    rooted: boolean;
    overlayDetected: boolean;
    vpn: boolean;
    callInProgress: boolean;
    recommendations: string[];
  }>;
}

const Native: TrusteerNativeModule | undefined = NativeModules.IBMTrusteer;

export const IBMTrusteerProvider: SecurityProvider = {
  id: 'trusteer',
  name: 'IBM Security Trusteer',
  regions: ['MACEDONIA'],

  async evaluate(ctx: ProviderContext): Promise<ProviderResult> {
    if (Native && typeof Native.assess === 'function') {
      const res = await Native.assess({customerId: 'YOUR_TRUSTEER_CUSTOMER_ID'});
      return {
        id: 'trusteer',
        name: 'IBM Security Trusteer',
        native: true,
        signals: [
          sig(
            'riskScore',
            `Risk score: ${res.riskScore}/1000`,
            res.riskScore >= 500,
            45,
          ),
          sig('malware', 'Malware detected', res.malwareDetected, 50),
          sig('rat', 'Remote access tool (RAT)', res.rat, 40),
          sig('emulator', 'Emulator', res.emulator, 15),
          sig('rooted', 'Rooted / jailbroken', res.rooted, 40),
          sig('overlay', 'Screen overlay', res.overlayDetected, 20),
          sig('vpn', 'VPN in use', res.vpn, 10),
          sig('call', 'Call in progress (social eng.)', res.callInProgress, 15),
        ],
      };
    }

    // Simulated Trusteer assessment from base signals.
    const {device, runtime, privacy, network} = ctx.base;
    const riskScore =
      ctx.profileIndex >= 2 ? 720 : ctx.profileIndex === 1 ? 380 : 90;
    return {
      id: 'trusteer',
      name: 'IBM Security Trusteer',
      native: false,
      signals: [
        sig('riskScore', `Risk score: ${riskScore}/1000`, riskScore >= 500, 45),
        sig(
          'malware',
          'Malware detected',
          runtime.suspiciousLibraries.length > 0,
          50,
        ),
        sig('rat', 'Remote access tool (RAT)', network.proxy && privacy.screenRecording, 40),
        sig('emulator', 'Emulator', device.emulator || device.simulator, 15),
        sig('rooted', 'Rooted / jailbroken', device.rooted || device.jailbroken, 40),
        sig('overlay', 'Screen overlay', privacy.overlayDetected, 20),
        sig('vpn', 'VPN in use', network.vpn, 10),
        sig('call', 'Call in progress (social eng.)', false, 15),
      ],
    };
  },
};

function sig(key: string, label: string, flagged: boolean, weight: number) {
  return {key, label, flagged, weight};
}
