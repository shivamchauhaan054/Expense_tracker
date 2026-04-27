export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

type RequestWithRetryOptions = Omit<RequestInit, "body"> & {
  body?: JsonValue;
  retries?: number;
  retryDelayMs?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number) {
  return status >= 500 || status === 429;
}

export async function requestJson<T>(
  input: RequestInfo | URL,
  options: RequestWithRetryOptions = {}
): Promise<T> {
  const { retries = 0, retryDelayMs = 400, headers, body, ...requestOptions } = options;

  let attempt = 0;
  while (true) {
    const response = await fetch(input, {
      ...requestOptions,
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });

    if (response.ok) {
      if (response.status === 204) {
        return null as T;
      }
      return (await response.json()) as T;
    }

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    const error = new ApiError(payload?.message ?? "Request failed", response.status);

    const canRetry =
      attempt < retries &&
      (isRetryableStatus(response.status) || requestOptions.method?.toUpperCase() === "GET");
    if (!canRetry) {
      throw error;
    }

    attempt += 1;
    await sleep(retryDelayMs * attempt);
  }
}
