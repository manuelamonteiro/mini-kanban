import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import type { ApiEnvelope } from "../types";
import { getApiBaseUrl } from "../utils";
import { getStoredTokens } from "./tokens";

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

export function unwrapApiData<T>(payload: T | ApiEnvelope<T>): T {
  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    return payload as T;
  }

  const envelope = payload as ApiEnvelope<T>;

  if (envelope.success === false) {
    const message = envelope.error?.message ?? "Request failed";
    throw new Error(message);
  }

  return envelope.data;
}

export function getAuthConfig(token?: string): AxiosRequestConfig {
  const accessToken = token ?? getStoredTokens()?.accessToken;
  if (!accessToken) return {};

  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
}

export default api;
export { api };
