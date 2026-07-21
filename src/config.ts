import {isDev} from './platform';

export type VendorId = 'threatmetrix' | 'trusteer';

export interface VendorEndpointConfig {
  baseUrl: string;
  apiKey?: string;
  orgId?: string;
  customerId?: string;
}

export interface SecurityKitConfig {
  sandbox: boolean;
  timeoutMs: number;
  retries: number;
  threatmetrix?: VendorEndpointConfig;
  trusteer?: VendorEndpointConfig;
}

const DEFAULT_CONFIG: SecurityKitConfig = {
  sandbox: true,
  timeoutMs: 8000,
  retries: 2,
};

let currentConfig: SecurityKitConfig = {...DEFAULT_CONFIG};

export function configure(partial: Partial<SecurityKitConfig>): void {
  if (partial.sandbox === false && isDev()) {
    // eslint-disable-next-line no-console
    console.warn(
      '[react-native-security-kit] sandbox disabled. Shipping vendor API keys ' +
        'in a mobile app is insecure; prefer proxying vendor calls through your ' +
        'own backend.',
    );
  }
  currentConfig = {...currentConfig, ...partial};
}

export function getConfig(): SecurityKitConfig {
  return currentConfig;
}

export function resetConfig(): void {
  currentConfig = {...DEFAULT_CONFIG};
}
