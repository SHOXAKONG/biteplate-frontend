import { useAuthStore } from "@/stores/auth";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:8000/api/v1").replace(/\/$/, "");

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  status: number;
  detail: string | null;
  constructor(message: string, status: number, detail: string | null) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

let refreshInFlight: Promise<void> | null = null;

async function tryRefresh(): Promise<boolean> {
  const auth = useAuthStore();
  if (!auth.refreshToken) return false;
  if (!refreshInFlight) {
    refreshInFlight = auth
      .refresh()
      .then(() => undefined)
      .catch(async () => {
        await auth.logout();
        window.location.assign("/login");
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  await refreshInFlight;
  return !!auth.accessToken;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  let url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) params.append(k, String(v));
    }
    const qs = params.toString();
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
  }
  return url;
}

async function send<T>(
  path: string,
  options: RequestOptions,
  withAuth: boolean,
  retried = false,
): Promise<T> {
  const auth = useAuthStore();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (withAuth && auth.accessToken) headers.Authorization = `Bearer ${auth.accessToken}`;

  const res = await fetch(buildUrl(path, options.query), {
    method: options.method || "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (res.status === 401 && withAuth) {
    if (retried) {
      // We already refreshed once and still got 401 — token is unusable
      // (likely wrong audience claim). Bail out instead of looping.
      await auth.logout();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
      throw new ApiError("Unauthorized after refresh", 401, null);
    }
    const refreshed = await tryRefresh();
    if (refreshed) return send<T>(path, options, withAuth, true);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;

  if (!res.ok) {
    const detail =
      typeof data === "object" && data && "detail" in data ? (data as any).detail : null;
    throw new ApiError(detail || res.statusText, res.status, detail);
  }
  return data as T;
}

export const api = {
  get<T>(path: string, options: RequestOptions = {}) {
    return send<T>(path, { ...options, method: "GET" }, true);
  },
  post<T>(path: string, body?: unknown, options: RequestOptions = {}) {
    return send<T>(path, { ...options, method: "POST", body }, true);
  },
  patch<T>(path: string, body?: unknown, options: RequestOptions = {}) {
    return send<T>(path, { ...options, method: "PATCH", body }, true);
  },
  del<T>(path: string, options: RequestOptions = {}) {
    return send<T>(path, { ...options, method: "DELETE" }, true);
  },
};

export const apiAnon = {
  post<T>(path: string, body?: unknown) {
    return send<T>(path, { method: "POST", body }, false);
  },
};
