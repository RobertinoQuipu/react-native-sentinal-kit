import {NativeModules, isDev} from '../platform';
import {getConfig, httpJson, HttpError} from '../net';
import {
  ProviderContext,
  ProviderResult,
  SecurityProvider,
  signal as sig,
} from './types';

/**
 * IBM Security Trusteer provider (MACEDONIA).
 * Source: https://www.ibm.com/products/trusteer
 *
 * Resolution order: native module -> direct REST call (when sandbox is off and
 * configured) -> simulated assessment derived from the base report.
 *
 * Native module `IBMTrusteer.assess({customerId})` should resolve to a device
 * risk assessment (riskScore 0-1000, malware, rat, emulator, rooted, overlay,
 * vpn, callInProgress, recommendations).
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

/**
 * Modeled Trusteer assess response. Field names are based on public docs and
 * MAY need tenant-specific adjustment for your Trusteer deployment.
 */
interface TrusteerApiResponse {
  riskScore: number;
  malwareDetected?: boolean;
  rat?: boolean;
  emulator?: boolean;
  rooted?: boolean;
  overlayDetected?: boolean;
  accessibilityRisk?: boolean;
  vpn?: boolean;
  recommendations?: string[];
}

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

    // Direct vendor REST call (only when sandbox is disabled and a configured
    // endpoint + credentials are present).
    const cfg = getConfig();
    const trusteer = cfg.trusteer;
    if (!cfg.sandbox && trusteer?.baseUrl && trusteer.apiKey) {
      try {
        const res = await httpJson<TrusteerApiResponse>({
          url: trusteer.baseUrl,
          method: 'POST',
          headers: {Authorization: `Bearer ${trusteer.apiKey}`},
          body: {
            customerId: trusteer.customerId,
            deviceContext: ctx.base,
          },
          timeoutMs: cfg.timeoutMs,
          retries: cfg.retries,
        });
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
            sig('malware', 'Malware detected', res.malwareDetected ?? false, 50),
            sig('rat', 'Remote access tool (RAT)', res.rat ?? false, 40),
            sig('emulator', 'Emulator', res.emulator ?? false, 15),
            sig('rooted', 'Rooted / jailbroken', res.rooted ?? false, 40),
            sig('overlay', 'Screen overlay', res.overlayDetected ?? false, 20),
            sig(
              'a11y',
              'Accessibility abuse',
              res.accessibilityRisk ?? false,
              25,
            ),
            sig('vpn', 'VPN in use', res.vpn ?? false, 10),
            sig(
              'call',
              'Call in progress (social eng.)',
              (res.recommendations?.length ?? 0) > 0,
              15,
            ),
          ],
        };
      } catch (err) {
        if (isDev()) {
          // eslint-disable-next-line no-console
          console.warn(
            '[IBMTrusteerProvider] Trusteer REST call failed, falling back to simulated assessment:',
            err instanceof HttpError ? `HTTP ${err.status}` : err,
          );
        }
        // Fall through to the simulated assessment below.
      }
    }

    // Derived Trusteer assessment from real base signals (used when the
    // Trusteer Mobile SDK is not linked). Risk score is computed from the
    // actual device/runtime/network/privacy findings.
    const {device, runtime, privacy, network, remoteAccess} = ctx.base;
    const activeRat = remoteAccess.remoteAccessApps.some(a => a.active);
    const installedRat = remoteAccess.remoteAccessApps.some(a => a.installed);
    const rat =
      activeRat || (network.proxy && privacy.screenRecording) || false;
    const overlay = privacy.overlayDetected || remoteAccess.overlayDetected;
    const riskScore = Math.min(
      1000,
      (device.rooted || device.jailbroken ? 400 : 0) +
        (runtime.suspiciousLibraries.length > 0 ? 300 : 0) +
        (activeRat ? 350 : installedRat ? 150 : 0) +
        (device.emulator || device.simulator ? 150 : 0) +
        (overlay ? 120 : 0) +
        (remoteAccess.accessibilityRisk ? 150 : 0) +
        (runtime.hookDetected ? 120 : 0) +
        (network.vpn ? 60 : 0),
    );
    const ratApps = remoteAccess.remoteAccessApps
      .map(a => a.name)
      .join(', ');
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
        sig('rat', 'Remote access tool (RAT)', rat, 40, ratApps || undefined),
        sig('emulator', 'Emulator', device.emulator || device.simulator, 15),
        sig('rooted', 'Rooted / jailbroken', device.rooted || device.jailbroken, 40),
        sig('overlay', 'Screen overlay', overlay, 20),
        sig('a11y', 'Accessibility abuse', remoteAccess.accessibilityRisk, 25),
        sig('vpn', 'VPN in use', network.vpn, 10),
        sig('call', 'Call in progress (social eng.)', false, 15),
      ],
    };
  },
};
