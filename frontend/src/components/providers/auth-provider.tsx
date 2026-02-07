"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ApiError, apiRequest } from "@/lib/api";
import type { AuthUser, LoginResponse, RefreshResponse, RegisterResponse } from "@/types/auth";

const ACCESS_TOKEN_KEY = "task_management_access_token";
const USER_KEY = "task_management_user";

type AuthContextValue = {
  isInitializing: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  user: AuthUser | null;
  errorMessage: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  authorizedRequest: <T>(path: string, options?: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown }) => Promise<T>;
};

type AuthorizedRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const setStoredSession = (accessToken: string | null, user: AuthUser | null) => {
  if (accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(USER_KEY);
  }
};

const readStoredUser = (): AuthUser | null => {
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const accessTokenRef = useRef<string | null>(null);

  const applySession = useCallback((token: string | null, nextUser: AuthUser | null) => {
    accessTokenRef.current = token;
    setAccessToken(token);
    setUser(nextUser);
    setStoredSession(token, nextUser);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await apiRequest<RefreshResponse>("/auth/refresh", {
        method: "POST",
        body: {},
      });

      accessTokenRef.current = response.accessToken;
      setAccessToken(response.accessToken);
      setStoredSession(response.accessToken, readStoredUser());
      return response.accessToken;
    } catch {
      applySession(null, null);
      return null;
    }
  }, [applySession]);

  const login = useCallback(
    async (email: string, password: string) => {
      setErrorMessage(null);

      try {
        const response = await apiRequest<LoginResponse>("/auth/login", {
          method: "POST",
          body: { email, password },
        });
        applySession(response.accessToken, response.user);
        return true;
      } catch (error) {
        if (error instanceof ApiError) {
          setErrorMessage(error.message);
          return false;
        }
        setErrorMessage("Unable to login right now");
        return false;
      }
    },
    [applySession],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      setErrorMessage(null);

      try {
        const response = await apiRequest<RegisterResponse>("/auth/register", {
          method: "POST",
          body: { email, password },
        });
        applySession(response.accessToken, response.user);
        return true;
      } catch (error) {
        if (error instanceof ApiError) {
          setErrorMessage(error.message);
          return false;
        }
        setErrorMessage("Unable to register right now");
        return false;
      }
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    setErrorMessage(null);
    try {
      await apiRequest<{ message: string }>("/auth/logout", {
        method: "POST",
        body: {},
      });
    } finally {
      applySession(null, null);
    }
  }, [applySession]);

  const authorizedRequest: AuthContextValue["authorizedRequest"] = useCallback(
    async <T,>(path: string, options: AuthorizedRequestOptions = {}) => {
      const attempt = async (token: string | null) =>
        apiRequest<T>(path, {
          method: options.method,
          body: options.body,
          accessToken: token,
        });

      try {
        return await attempt(accessTokenRef.current);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          const freshToken = await refreshAccessToken();
          if (!freshToken) {
            throw error;
          }
          return attempt(freshToken);
        }
        throw error;
      }
    },
    [refreshAccessToken],
  );

  useEffect(() => {
    const storedToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedUser = readStoredUser();

    accessTokenRef.current = storedToken;
    setAccessToken(storedToken);
    setUser(storedUser);

    refreshAccessToken().finally(() => setIsInitializing(false));
  }, [refreshAccessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isInitializing,
      isAuthenticated: Boolean(accessToken),
      accessToken,
      user,
      errorMessage,
      login,
      register,
      logout,
      clearError,
      authorizedRequest,
    }),
    [
      isInitializing,
      accessToken,
      user,
      errorMessage,
      login,
      register,
      logout,
      clearError,
      authorizedRequest,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
