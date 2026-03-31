const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
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
  get: () => (typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY)),
  set: (token: string) => {
    if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear: () => {
    if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
  },
};

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
      authTokenStorage.clear();
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    throw new Error(message);
  }

  return payload as T;
}

export { API_BASE_URL };
