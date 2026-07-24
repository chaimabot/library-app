const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const TOKEN_KEY = "libris_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  auth: {
    login: (data) =>
      request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    register: (data) =>
      request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    me: () => request("/auth/me"),
    updateProfile: (data) =>
      request("/auth/profile", { method: "PUT", body: JSON.stringify(data) }),
    logout: () => request("/auth/logout", { method: "POST" }),
  },
  books: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/books${qs ? `?${qs}` : ""}`);
    },
    stats: () => request("/books/stats"),
    get: (id) => request(`/books/${id}`),
    create: (data) =>
      request("/books", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) =>
      request(`/books/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => request(`/books/${id}`, { method: "DELETE" }),
  },
  members: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/members${qs ? `?${qs}` : ""}`);
    },
    get: (id) => request(`/members/${id}`),
    create: (data) =>
      request("/members", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) =>
      request(`/members/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => request(`/members/${id}`, { method: "DELETE" }),
  },
  borrowings: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/borrowings${qs ? `?${qs}` : ""}`);
    },
    get: (id) => request(`/borrowings/${id}`),
    create: (data) =>
      request("/borrowings", { method: "POST", body: JSON.stringify(data) }),
    return: (id) => request(`/borrowings/${id}/return`, { method: "PUT" }),
    remove: (id) => request(`/borrowings/${id}`, { method: "DELETE" }),
  },
};
