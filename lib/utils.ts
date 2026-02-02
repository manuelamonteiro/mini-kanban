import type { AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ApiEnvelope } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
}

export function parseErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;

  if (error instanceof Error) return error.message;

  const axiosErr = error as AxiosError<unknown>;
  if (axiosErr?.isAxiosError) {
    const data = axiosErr.response?.data;

    if (data && typeof data === "object" && "success" in data && "error" in data) {
      const env = data as ApiEnvelope<unknown>;
      return env.error?.message ?? "Request failed.";
    }

    if (data && typeof data === "object" && "message" in data) {
      const maybe = (data as Record<string, unknown>).message;
      if (typeof maybe === "string") return maybe;
    }

    return axiosErr.message || "Request failed.";
  }

  if (error && typeof error === "object" && "message" in error) {
    const maybe = (error as Record<string, unknown>).message;
    if (typeof maybe === "string") return maybe;
  }

  return "Something went wrong. Please try again.";
}
