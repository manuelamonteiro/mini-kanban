"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { clearTokens, getStoredTokens, storeTokens } from "../service/tokens";

type AuthContextValue = {
  accessToken: string | null;
  isAuthenticated: boolean;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(() => {
    return getStoredTokens()?.accessToken ?? null;
  });

  function setAccessToken(token: string | null) {
    setAccessTokenState(token);
    storeTokens(token ? { accessToken: token } : null);
  }

  function logout() {
    clearTokens();
    setAccessTokenState(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken),
      setAccessToken,
      logout,
    }),
    [accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function useAuthGuard() {
  const { isAuthenticated } = useAuth();
  return { isAuthenticated };
}
