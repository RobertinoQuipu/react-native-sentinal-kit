export class HttpError extends Error {
  status: number;
  body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export interface HttpJsonOptions {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_RETRIES = 2;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function httpJson<T>(opts: HttpJsonOptions): Promise<T> {
  const {
    url,
    method = 'GET',
    headers = {},
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
  } = opts;

  const requestHeaders: Record<string, string> = { Accept: 'application/json', ...headers };
  let serializedBody: string | undefined;
  if (body !== undefined) {
    serializedBody = JSON.stringify(body);
    if (requestHeaders['Content-Type'] === undefined && requestHeaders['content-type'] === undefined) {
      requestHeaders['Content-Type'] = 'application/json';
    }
  }

  const maxAttempts = Math.max(0, retries) + 1;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: serializedBody,
        signal: controller.signal,
      });

      if (response.ok) {
        const parsed = await parseBody(response);
        return parsed as T;
      }

      const errorBody = await parseBody(response);
      const httpError = new HttpError(
        response.status,
        `HTTP ${response.status} ${response.statusText} for ${method} ${url}`,
        errorBody,
      );

      // Retry only on 5xx; never on 4xx.
      if (response.status >= 500 && attempt < maxAttempts) {
        lastError = httpError;
        await delay(200 * attempt);
        continue;
      }

      throw httpError;
    } catch (err) {
      // HttpError for 4xx (or exhausted 5xx) must propagate without retrying.
      if (err instanceof HttpError) {
        throw err;
      }

      // Network/abort error: retry if attempts remain.
      lastError = err;
      if (attempt < maxAttempts) {
        await delay(200 * attempt);
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('httpJson failed with an unknown error');
}
