import type { AuthTokens } from "../types";

export const ACCESS_TOKEN_COOKIE_NAME = "mk_access";
const ACCESS_TOKEN_MAX_AGE_SECONDS = 24 * 60 * 60;

type CookieOptions = {
  maxAgeSeconds?: number;
};

const isBrowser = typeof document !== "undefined";

function setCookie(name: string, value: string, options: CookieOptions = {}) {
  if (!isBrowser) return;

  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "SameSite=Lax",
  ];

  if (options.maxAgeSeconds !== undefined) {
    parts.push(`Max-Age=${options.maxAgeSeconds}`);
  }

  if (window.location.protocol === "https:") {
    parts.push("Secure");
  }

  document.cookie = parts.join("; ");
}

function deleteCookie(name: string) {
  if (!isBrowser) return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function readCookie(name: string): string | null {
  if (!isBrowser) return null;

  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

export function getStoredTokens(): AuthTokens | null {
  const accessToken = readCookie(ACCESS_TOKEN_COOKIE_NAME);
  if (!accessToken) return null;
  return { accessToken };
}

export function storeTokens(tokens: AuthTokens | null) {
  if (!tokens) {
    clearTokens();
    return;
  }

  setCookie(ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, {
    maxAgeSeconds: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });
}

export function clearTokens() {
  deleteCookie(ACCESS_TOKEN_COOKIE_NAME);
}

export function getAccessToken(): string | null {
  return getStoredTokens()?.accessToken ?? null;
}

export function setAccessToken(token: string | null) {
  storeTokens(token ? { accessToken: token } : null);
}
