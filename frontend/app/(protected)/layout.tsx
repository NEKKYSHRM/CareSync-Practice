import type { ReactNode } from "react";
import AuthGuard from "../components/auth-guard";
import Sidebar from "../components/navigation/sidebar";
import Header from "../components/navigation/header";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F5F9F9] lg:flex">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Header />

          <main>{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}