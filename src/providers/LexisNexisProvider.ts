import {NativeModules, isDev} from '../platform';
import {getConfig, httpJson, HttpError} from '../net';
import {
  ProviderContext,
  ProviderResult,
  SecurityProvider,
  signal as sig,
} from './types';

/**
 * LexisNexis ThreatMetrix provider (MOLDOVA).
 *
 * Resolution order: native module -> direct REST call (when sandbox is off and
 * configured) -> simulated decision derived from the base report.
 *
 * Native module `LexisNexisThreatMetrix.profile({orgId, sessionId})` should
 * resolve to { riskRating, reasons, deviceId, vpn, proxy, tor, emulator }.
 */

interface TmxNativeModule {
  profile(config: {orgId: string; sessionId: string}): Promise<{
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

/**
 * Modeled ThreatMetrix session-query response. Field names are based on public
 * docs and MAY need tenant-specific adjustment for your TMX policy.
 */
interface TmxApiResponse {
  risk_rating: 'trusted' | 'neutral' | 'medium' | 'high';
  reasons?: string[];
  device_id?: string;
  vpn?: boolean;
  proxy?: boolean;
  tor?: boolean;
  emulator?: boolean;
}

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

    // Direct vendor REST call (only when sandbox is disabled and a configured
    // endpoint + credentials are present).
    const cfg = getConfig();
    const tmx = cfg.threatmetrix;
    if (!cfg.sandbox && tmx?.baseUrl && tmx.apiKey) {
      try {
        const sessionId = `mdl-${Date.now()}`;
        const res = await httpJson<TmxApiResponse>({
          url: tmx.baseUrl,
          method: 'POST',
          body: {
            org_id: tmx.orgId,
            api_key: tmx.apiKey,
            session_id: sessionId,
            service_type: 'session-policy',
          },
          timeoutMs: cfg.timeoutMs,
          retries: cfg.retries,
        });
        const highRisk =
          res.risk_rating === 'high' || res.risk_rating === 'medium';
        return {
          id: 'lexisnexis',
          name: 'LexisNexis ThreatMetrix',
          native: true,
          signals: [
            sig('riskRating', `Risk rating: ${res.risk_rating}`, highRisk, 45),
            sig('vpn', 'VPN detected', res.vpn ?? false, 10),
            sig('proxy', 'Proxy detected', res.proxy ?? false, 12),
            sig('tor', 'TOR exit node', res.tor ?? false, 25),
            sig('emulator', 'Emulator', res.emulator ?? false, 15),
            ...(res.reasons ?? []).map((r, i) => sig(`reason-${i}`, r, true, 8)),
          ],
        };
      } catch (err) {
        if (isDev()) {
          // eslint-disable-next-line no-console
          console.warn(
            '[LexisNexisProvider] ThreatMetrix REST call failed, falling back to simulated decision:',
            err instanceof HttpError ? `HTTP ${err.status}` : err,
          );
        }
        // Fall through to the simulated decision below.
      }
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
