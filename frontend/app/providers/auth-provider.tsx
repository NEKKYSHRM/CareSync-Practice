
"use client";

import { useEffect, type ReactNode } from "react";
import { restoreSession } from "../lib/auth";
import { useAuthStore } from "../store/auth-store";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({
  children,
}: AuthProviderProps) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    let cancelled = false;

    async function initializeAuth() {
      console.log("AuthProvider: initializing authentication");

      setLoading(true);

      try {
        const session = await restoreSession();

        if (cancelled) return;

        setAuth(session.user, session.accessToken);

        console.log("AuthProvider: session restored");
      } catch (error) {
        if (cancelled) return;

        useAuthStore.getState().logout();

        console.log("AuthProvider: no valid session to restore", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initializeAuth();

    return () => {
      cancelled = true;
    };
  }, [setAuth, setLoading]);

  return <>{children}</>;
}
