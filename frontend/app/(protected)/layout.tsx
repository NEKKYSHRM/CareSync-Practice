"use client";

import { useState, type ReactNode } from "react";
import AuthGuard from "../components/auth-guard";
import Sidebar from "../components/navigation/sidebar";
import Header from "../components/navigation/header";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((previous) => !previous);
  };

  return (
    <AuthGuard>
      <div className="flex h-dvh w-full overflow-hidden bg-[#F5F9F9]">
        {/* Sidebar always fills the viewport height */}
        <aside
          className={`relative z-20 h-dvh shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
            isSidebarOpen ? "w-[240px]" : "w-[68px]"
          }`}
        >
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={toggleSidebar}
          />
        </aside>

        {/* Main application area */}
        <div className="flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Header />

          <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}