import {
  ProviderContext,
  ProviderResult,
  SecurityProvider,
  signal as sig,
} from './types';

/**
 * JailMonkey on-device root/jailbreak detection.
 *
 * Uses the real `jail-monkey` native library when it is linked. In the
 * JS-only demo (no native build) it falls back to the simulation engine's
 * base report so the UI stays fully functional.
 *
 * JailMonkey is the shared baseline provider for BOTH regions.
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

function loadJailMonkey(): JailMonkeyApi | null {
  try {
    // Lazily required so the demo runs even if the module isn't installed/linked.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('jail-monkey');
    const api = (mod?.default ?? mod) as JailMonkeyApi;
    if (api && typeof api.isJailBroken === 'function') {
      return api;
    }
    return null;
  } catch {
    return null;
  }
}

export const JailMonkeyProvider: SecurityProvider = {
  id: 'jailmonkey',
  name: 'JailMonkey',
  regions: ['MOLDOVA', 'MACEDONIA'],

  async evaluate(ctx: ProviderContext): Promise<ProviderResult> {
    const jm = loadJailMonkey();

    if (jm) {
      const [debugged, devSettings] = await Promise.all([
        Promise.resolve(jm.isDebuggedMode?.() ?? false),
        Promise.resolve(jm.isDevelopmentSettingsMode?.() ?? false),
      ]);

      return {
        id: 'jailmonkey',
        name: 'JailMonkey',
        native: true,
        signals: [
          sig('jailbroken', 'Jailbroken / rooted', jm.isJailBroken(), 40),
          sig('mockLocation', 'Mock location allowed', jm.canMockLocation(), 12),
          sig('trustFall', 'Trust fall (tamper)', jm.trustFall(), 30),
          sig('hooks', 'Runtime hooks', jm.hookDetected?.() ?? false, 30),
          sig('debugged', 'Debugged mode', !!debugged, 20),
          sig('devSettings', 'Development settings', !!devSettings, 8),
        ],
      };
    }

    // Simulated fallback derived from the base report.
    const {device, runtime} = ctx.base;
    const jailed = device.rooted || device.jailbroken;
    return {
      id: 'jailmonkey',
      name: 'JailMonkey',
      native: false,
      signals: [
        sig('jailbroken', 'Jailbroken / rooted', jailed, 40),
        sig('mockLocation', 'Mock location allowed', device.developerMode, 12),
        sig('trustFall', 'Trust fall (tamper)', runtime.hookDetected, 30),
        sig('hooks', 'Runtime hooks', runtime.hookDetected, 30),
        sig('debugged', 'Debugged mode', runtime.debuggerAttached, 20),
        sig('devSettings', 'Development settings', device.developerMode, 8),
      ],
    };
  },
};
