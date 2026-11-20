
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  UserRound,
  Mail,
  ShieldCheck,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Pencil,
} from "lucide-react";
import { useAuthStore } from "@/app/store/auth-store";

function getInitials(fullName: string): string {
  return (
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U"
  );
}

function formatDate(value: string | undefined): string {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | undefined): string {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function page() {
  const user = useAuthStore((state) => state.user);

  const fullName = user?.full_name?.trim() || "User";
  const initials = getInitials(fullName);
  const isActive = user?.is_active === true;

  return (
    <div className="min-h-screen bg-[#F0F9F8] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Page heading */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[#527674] transition hover:text-[#003B3B]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>

            <h1 className="text-2xl font-bold tracking-tight text-[#003B3B] sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-1 text-sm text-[#66817F]">
              View your account information and profile details.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#CDEBE5] bg-white px-3 py-2 text-xs font-medium text-[#005B50]">
            <ShieldCheck className="h-4 w-4 text-[#00A995]" />
            Account information
          </div>
        </div>

        {/* Profile overview */}
        <section className="overflow-hidden rounded-2xl border border-[#DCEBE9] bg-white shadow-sm">
          <div className="h-2 bg-[#00C9B1]" />

          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-8">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#D8F7F1] text-2xl font-bold text-[#003B3B] ring-1 ring-[#BDECE4]">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="break-words text-xl font-bold text-[#003B3B] sm:text-2xl">
                {fullName}
              </h2>

              <p className="mt-1 break-all text-sm text-[#66817F]">
                {user?.email || "Email not available"}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F7F3] px-3 py-1 text-xs font-semibold text-[#00695C]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {user?.role ? formatRole(user.role) : "Role unavailable"}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {isActive ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {isActive ? "Active account" : "Inactive account"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Personal information */}
        <section className="rounded-2xl border border-[#DCEBE9] bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F7F3] text-[#007F73]">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-[#003B3B]">
                Personal Information
              </h2>
              <p className="mt-0.5 text-xs text-[#66817F]">
                Your registered account details
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E5EFEE] p-4">
              <div className="mb-2 flex items-center gap-2 text-[#66817F]">
                <UserRound className="h-4 w-4" />
                <span className="text-xs font-medium">Full name</span>
              </div>
              <p className="break-words text-sm font-semibold text-[#003B3B]">
                {fullName}
              </p>
            </div>

            <div className="rounded-xl border border-[#E5EFEE] p-4">
              <div className="mb-2 flex items-center gap-2 text-[#66817F]">
                <Mail className="h-4 w-4" />
                <span className="text-xs font-medium">Email address</span>
              </div>
              <p className="break-all text-sm font-semibold text-[#003B3B]">
                {user?.email || "Not available"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E5EFEE] p-4">
              <div className="mb-2 flex items-center gap-2 text-[#66817F]">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs font-medium">Account role</span>
              </div>
              <p className="text-sm font-semibold text-[#003B3B]">
                {user?.role ? formatRole(user.role) : "Not available"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E5EFEE] p-4">
              <div className="mb-2 flex items-center gap-2 text-[#66817F]">
                <Stethoscope className="h-4 w-4" />
                <span className="text-xs font-medium">Account status</span>
              </div>
              <p className="text-sm font-semibold text-[#003B3B]">
                {user ? (isActive ? "Active" : "Inactive") : "Not available"}
              </p>
            </div>
          </div>
        </section>

        {/* Account information */}
        <section className="rounded-2xl border border-[#DCEBE9] bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F7F3] text-[#007F73]">
              <Clock3 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-[#003B3B]">
                Account Information
              </h2>
              <p className="mt-0.5 text-xs text-[#66817F]">
                Account creation and last update
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-5 w-5 text-[#00A995]" />

              <div>
                <p className="text-xs text-[#66817F]">Member since</p>
                <p className="mt-1 text-sm font-semibold text-[#003B3B]">
                  {formatDate(user?.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-5 w-5 text-[#00A995]" />

              <div>
                <p className="text-xs text-[#66817F]">Last profile update</p>
                <p className="mt-1 text-sm font-semibold text-[#003B3B]">
                  {formatDateTime(user?.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Future profile editing */}
        {/* <div className="flex items-start gap-3 rounded-xl border border-[#D5E7E4] bg-white p-4">
          <Pencil className="mt-0.5 h-4 w-4 shrink-0 text-[#007F73]" />

          <p className="text-xs leading-5 text-[#527674]">
            Profile editing is not connected yet. We'll enable it after
            confirming the backend's profile update endpoint and permitted
            fields.
          </p>
        </div> */}
      </div>
    </div>
  );
}
