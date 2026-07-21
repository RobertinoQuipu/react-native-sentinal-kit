export declare class HttpError extends Error {
    status: number;
    body?: unknown;
    constructor(status: number, message: string, body?: unknown);
}
export interface HttpJsonOptions {
    url: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: unknown;
    timeoutMs?: number;
    retries?: number;
}
export declare function httpJson<T>(opts: HttpJsonOptions): Promise<T>;
