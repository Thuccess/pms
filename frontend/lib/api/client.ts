/** localStorage key for cached user (session bootstrap on reload). */
export const USER_SESSION_KEY = "user";

const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
const API_BASE_URL = /\/api$/i.test(RAW_API_BASE_URL.replace(/\/+$/, ""))
  ? RAW_API_BASE_URL.replace(/\/+$/, "")
  : `${RAW_API_BASE_URL.replace(/\/+$/, "")}/api`;
const TOKEN_KEY = "luxorld_auth_token";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

const parseJson = async (res: Response) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

export const authTokenStorage = {
  get: () => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(TOKEN_KEY);
    return raw ? raw.trim() : null;
  },
  set: (token: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_KEY, token.trim());
  },
  clear: () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
  },
};

/** Clear token + cached user (keep in sync everywhere we force logout). */
export function clearAuthSession() {
  authTokenStorage.clear();
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(USER_SESSION_KEY);
  }
}

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

/** Register in AuthProvider so 401s update React state instead of a hard reload. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized() {
  clearAuthSession();
  if (unauthorizedHandler) {
    unauthorizedHandler();
  } else if (typeof window !== "undefined" && window.location.pathname !== "/") {
    window.location.href = "/";
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isFormData) {
    headers.set("Content-Type", headers.get("Content-Type") || "application/json");
  }

  if (options.auth !== false) {
    const token = authTokenStorage.get();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await parseJson(response);

  if (!response.ok) {
    const message = payload?.message || "Request failed";
    if (response.status === 401) {
      notifyUnauthorized();
    }
    throw new Error(message);
  }

  return payload as T;
}

export { API_BASE_URL };
