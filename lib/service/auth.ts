import type { ApiAuthResponse, ApiEnvelope, AuthResponse } from "../types";
import api, { unwrapApiData } from "./api";
import { mapAuthFromApi } from "./mappers";

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<ApiEnvelope<ApiAuthResponse>>("/auth/login", { email, password });
  return mapAuthFromApi(unwrapApiData(data));
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<ApiEnvelope<ApiAuthResponse>>("/auth/register", {
    name,
    email,
    password,
  });
  return mapAuthFromApi(unwrapApiData(data));
}
