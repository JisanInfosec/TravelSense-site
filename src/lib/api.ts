export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "travelsense.token";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details: string[] = [],
  ) {
    super(message);
  }
}

export const tokenStore = {
  get(): string | null {
    try {
      return typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string | null) {
    try {
      if (token) window.localStorage.setItem(TOKEN_KEY, token);
      else window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable (private mode) — session lasts until reload */
    }
  },
};

type Body = Record<string, unknown> | unknown[] | FormData;

export async function api<T>(
  path: string,
  init: { method?: string; body?: Body; signal?: AbortSignal } = {},
): Promise<T> {
  const token = tokenStore.get();
  const isForm = init.body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: init.method ?? "GET",
      headers: {
        ...(isForm || !init.body ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: isForm ? (init.body as FormData) : init.body ? JSON.stringify(init.body) : undefined,
      signal: init.signal,
    });
  } catch {
    throw new ApiError("We couldn't reach the TravelSense server. Check your connection and try again.", 0);
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const raw = data?.message;
    const details: string[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const message = details[0] ?? (res.status >= 500 ? "Something went wrong on our side. Please try again." : "Request failed.");
    throw new ApiError(message, res.status, details);
  }
  return data as T;
}

/** SWR fetcher */
export const fetcher = <T,>(path: string) => api<T>(path);
