import {NativeModules} from '../platform';
import {ProviderContext, ProviderResult, SecurityProvider} from './types';

/**
 * LexisNexis ThreatMetrix provider — engaged for the MOLDOVA region.
 *
 * NOTE ON SOURCES: the provided URL
 *   https://www.lexisnexis.com/supportandtraining/lexis-create/b/resources/
 *   posts/lexis-create-plus-install-guide
 * documents "Lexis Create+", the Microsoft Word legal-drafting add-in — NOT
 * the mobile device-intelligence product. That page only links a PDF
 * (LexisCreate+_InstallGuide_2025.pdf) with no inline SDK steps.
 *
 * For mobile fraud / device intelligence you integrate the LexisNexis Risk
 * Solutions "ThreatMetrix" (TMX) Mobile SDK, which profiles the session and
 * returns a risk decision from the LexisNexis backend. Expose it to JS via a
 * native module named `LexisNexisThreatMetrix`.
 *
 * Expected native interface (implement in Kotlin/Swift):
 *   profile(orgId, sessionId): Promise<{
 *     riskRating: 'trusted' | 'neutral' | 'medium' | 'high',
 *     reasons: string[],
 *     deviceId: string,
 *     vpn: boolean, proxy: boolean, tor: boolean, emulator: boolean,
 *   }>
 *
 * When the native module is absent we synthesize an equivalent decision from
 * the base report so the demo remains runnable.
 */

interface TmxNativeModule {
  profile(config: {
    orgId: string;
    sessionId: string;
  }): Promise<{
    riskRating: 'trusted' | 'neutral' | 'medium' | 'high';
    reasons: string[];
    deviceId: string;
    vpn: boolean;
    proxy: boolean;
    tor: boolean;
    emulator: boolean;
  }>;
}

const Native: TmxNativeModule | undefined =
  NativeModules.LexisNexisThreatMetrix;

export const LexisNexisProvider: SecurityProvider = {
  id: 'lexisnexis',
  name: 'LexisNexis ThreatMetrix',
  regions: ['MOLDOVA'],

  async evaluate(ctx: ProviderContext): Promise<ProviderResult> {
    if (Native && typeof Native.profile === 'function') {
      const sessionId = `mdl-${Date.now()}`;
      const res = await Native.profile({
        // Replace with your LexisNexis org id / API key handling.
        orgId: 'YOUR_TMX_ORG_ID',
        sessionId,
      });
      const highRisk =
        res.riskRating === 'high' || res.riskRating === 'medium';
      return {
        id: 'lexisnexis',
        name: 'LexisNexis ThreatMetrix',
        native: true,
        signals: [
          sig('riskRating', `Risk rating: ${res.riskRating}`, highRisk, 45),
          sig('vpn', 'VPN detected', res.vpn, 10),
          sig('proxy', 'Proxy detected', res.proxy, 12),
          sig('tor', 'TOR exit node', res.tor, 25),
          sig('emulator', 'Emulator', res.emulator, 15),
          ...res.reasons.map((r, i) =>
            sig(`reason-${i}`, r, true, 8),
          ),
        ],
      };
    }

    // Derived ThreatMetrix decision from real base signals (used when the
    // native TMX SDK is not linked).
    const {device, network, runtime} = ctx.base;
    const riskFactors =
      (device.rooted || device.jailbroken ? 1 : 0) +
      (device.emulator || device.simulator ? 1 : 0) +
      (network.vpn || network.proxy ? 1 : 0) +
      (runtime.hookDetected || runtime.debuggerAttached ? 1 : 0);
    const rating =
      riskFactors >= 2 ? 'high' : riskFactors === 1 ? 'medium' : 'trusted';
    const highRisk = rating === 'high' || rating === 'medium';
    return {
      id: 'lexisnexis',
      name: 'LexisNexis ThreatMetrix',
      native: false,
      signals: [
        sig('riskRating', `Risk rating: ${rating}`, highRisk, 45),
        sig('vpn', 'VPN detected', network.vpn, 10),
        sig('proxy', 'Proxy detected', network.proxy, 12),
        sig('tor', 'TOR exit node', network.dnsChanged && network.proxy, 25),
        sig('emulator', 'Emulator', device.emulator || device.simulator, 15),
        sig('botSignature', 'Bot / automation signature', runtime.hookDetected, 20),
      ],
    };
  },
};

function sig(key: string, label: string, flagged: boolean, weight: number) {
  return {key, label, flagged, weight};
}
