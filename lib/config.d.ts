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
export declare function configure(partial: Partial<SecurityKitConfig>): void;
export declare function getConfig(): SecurityKitConfig;
export declare function resetConfig(): void;
