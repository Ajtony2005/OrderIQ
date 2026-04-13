const defaultBaseUrl = import.meta.env.DEV ? "http://127.0.0.1:3000/api/v1" : "/api/v1";

const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
const normalizedBaseUrl = configuredBaseUrl?.replace(/\/+$/, "");

export const API_BASE_URL =
  !normalizedBaseUrl || normalizedBaseUrl === "/api" ? defaultBaseUrl : normalizedBaseUrl;

type ApiErrorDetailsItem = {
  path?: Array<string | number>;
  message?: string;
};

type ApiErrorPayload = {
  message?: string | string[];
  details?: ApiErrorDetailsItem[];
  error?: string;
};

function extractErrorMessage(status: number, payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const typed = payload as ApiErrorPayload;

    if (Array.isArray(typed.details) && typed.details.length > 0) {
      const detailMessages = typed.details
        .map((detail) => {
          if (!detail || typeof detail !== "object") {
            return null;
          }

          const path = Array.isArray(detail.path) ? detail.path.join(".") : "";
          const issueMessage =
            typeof detail.message === "string" ? detail.message.trim() : "Ervenytelen adat";

          return path ? `${path}: ${issueMessage}` : issueMessage;
        })
        .filter((detail): detail is string => Boolean(detail && detail.trim()));

      if (detailMessages.length > 0) {
        return `HTTP ${status}: ${detailMessages.join("; ")}`;
      }
    }

    if (Array.isArray(typed.message)) {
      const joined = typed.message
        .map((item) => item.trim())
        .filter(Boolean)
        .join("; ");
      if (joined) {
        return `HTTP ${status}: ${joined}`;
      }
    }

    if (typeof typed.message === "string" && typed.message.trim()) {
      return `HTTP ${status}: ${typed.message.trim()}`;
    }

    if (typeof typed.error === "string" && typed.error.trim()) {
      return `HTTP ${status}: ${typed.error.trim()}`;
    }
  }

  const cleanedFallback = fallback.trim();
  return cleanedFallback ? `HTTP ${status}: ${cleanedFallback}` : `Request failed: ${status}`;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("auth_token");
  const hasBody = typeof options.body !== "undefined" && options.body !== null;
  const baseHeaders: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (hasBody) {
    baseHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...baseHeaders,
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const rawBody = await response.text();
    let parsedBody: unknown = null;

    if (rawBody) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        parsedBody = null;
      }
    }

    throw new Error(extractErrorMessage(response.status, parsedBody, rawBody));
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
