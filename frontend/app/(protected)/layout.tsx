
import type { ReactNode } from "react";
import AuthGuard from "../components/auth-guard";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  console.log("Protected layout rendered");
  return <AuthGuard>{children}</AuthGuard>;
}
