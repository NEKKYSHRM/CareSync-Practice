
"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "../store/auth-store";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({
  children,
}: AuthProviderProps) {
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    // The current backend does not yet support session restoration.
    // Authentication is therefore kept in memory for now.
    setLoading(false);
  }, [setLoading]);

  return <>{children}</>;
}
