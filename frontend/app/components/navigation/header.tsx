"use client";

import { useEffect, useState } from "react";
import { Search, Bell, Mail, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/app/store/auth-store";
import Link from "next/link";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";

  return "Good night";
}

function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function Header() {
  const user = useAuthStore((state) => state.user);

  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getGreeting());
    };

    updateGreeting();

    const intervalId = window.setInterval(updateGreeting, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const fullName = user?.full_name?.trim() || "";
  const displayName = fullName || "there";
  const initials = fullName ? getInitials(fullName) : "U";
  const isDoctor = user?.role === "doctor";

  return (
    <header className="sticky top-0 z-30 flex h-19 items-center justify-between gap-4 border-b border-[#DCEBE9] bg-white px-5 sm:px-8">
      {/* Greeting */}
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-[#003B3B] sm:text-lg">
          {greeting}, {isDoctor ? "Dr. " : ""}
          {displayName}! 👋
        </h1>

        <p className="mt-1 hidden text-xs text-[#66817F] sm:block">
          Here's what's happening at your clinic today.
        </p>
      </div>

      {/* Right-side actions */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {/* Search */}
        <div className="hidden w-56 items-center gap-2 rounded-lg border border-[#D5E7E4] bg-white px-3 py-2 lg:flex xl:w-72">
          <Search className="h-4 w-4 shrink-0 text-[#66817F]" />

          <input
            type="search"
            placeholder="Search patients, appointments..."
            aria-label="Search patients and appointments"
            className="min-w-0 flex-1 bg-transparent text-xs text-[#003B3B] outline-none placeholder:text-[#829996]"
          />

          <span className="whitespace-nowrap rounded border border-[#D5E7E4] px-1.5 py-0.5 text-[10px] text-[#66817F]">
            Ctrl K
          </span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications, 3 unread"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#D5E7E4] text-[#285653] transition hover:bg-[#F0F9F8]"
        >
          <Bell className="h-4.75 w-4.75" />

          <span className="absolute -right-0.5 -top-0.5 flex h-4.25 min-w-4.25 items-center justify-center rounded-full bg-[#00A995] px-1 text-[10px] font-semibold text-white">
            3
          </span>
        </button>

        {/* Messages */}
        <button
          type="button"
          aria-label="Messages, 5 unread"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#D5E7E4] text-[#285653] transition hover:bg-[#F0F9F8]"
        >
          <Mail className="h-4.75 w-4.75" />

          <span className="absolute -right-0.5 -top-0.5 flex h-4.25 min-w-4.25 items-center justify-center rounded-full bg-[#00A995] px-1 text-[10px] font-semibold text-white">
            5
          </span>
        </button>

        {/* Authenticated user profile */}
        <Link
          href="/profile"
          aria-label={`Profile: ${fullName || "User"}, ${user?.role ?? "unknown role"}`}
          title={fullName || "User profile"}
          className="flex items-center gap-2 rounded-full p-1 transition hover:bg-[#F0F9F8]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00C9B1] text-sm font-bold text-[#003B3B] ring-2 ring-white">
            {initials}
          </div>

          <div className="hidden min-w-0 text-left xl:block">
            <p className="max-w-32 truncate text-xs font-semibold text-[#003B3B]">
              {fullName || "User"}
            </p>

            <p className="text-[10px] text-[#66817F]">
              {user?.role ? formatRole(user.role) : "Loading profile"}
            </p>
          </div>

          <ChevronDown className="hidden h-4 w-4 text-[#527674] sm:block" />
        </Link>
      </div>
    </header>
  );
}
