"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  HeartPulse,
  Mail,
  LockKeyhole,
  UserRound,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { register } from "@/app/lib/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        full_name: fullName,
        email,
        password,
      });

      router.replace("/login");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-white">
      {/* Left branding panel */}
      <section className="relative hidden overflow-hidden bg-[#003b38] text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="pointer-events-none absolute -right-40 top-20 size-[450px] rounded-full bg-teal-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-[400px] rounded-full bg-cyan-400/10 blur-3xl" />

        <Link href="/" className="relative z-10 flex w-fit items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl bg-teal-400 text-[#003b38]">
            <HeartPulse size={28} strokeWidth={2.2} />
          </span>

          <span className="text-2xl font-bold tracking-tight">
            CareSync<span className="text-teal-300">.</span>
          </span>
        </Link>

        <div className="relative z-10 my-16 max-w-xl">
          <p className="mb-7 text-sm font-bold tracking-[0.24em] text-teal-300 uppercase">
            Better care, connected
          </p>

          <h1 className="text-4xl leading-[1.18] font-bold tracking-tight xl:text-5xl">
            A better way to
            <span className="block text-teal-300">manage your practice.</span>
          </h1>

          <p className="mt-7 max-w-lg text-lg leading-9 text-teal-100/80">
            Create your practice account and bring your patient records,
            appointments, consultations, and daily workflows together.
          </p>

          <div className="mt-10 space-y-5">
            {[
              "Organize patient information",
              "Simplify appointment management",
              "Keep daily operations connected",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="shrink-0 text-teal-300" size={20} />
                <span className="text-sm text-teal-50/90">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm text-teal-200/70">
          Built for more organized, connected care.
        </p>
      </section>

      {/* Registration form */}
      <section className="flex w-full items-center justify-center px-5 py-10 sm:px-10 lg:w-1/2 lg:px-12">
        <div className="w-full max-w-[460px]">
          {/* Mobile logo */}
          <Link
            href="/"
            className="mb-10 flex w-fit items-center gap-2.5 lg:hidden"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-teal-500 text-white">
              <HeartPulse size={24} />
            </span>

            <span className="text-xl font-bold tracking-tight text-slate-900">
              CareSync<span className="text-teal-600">.</span>
            </span>
          </Link>

          <div className="mb-8">
            <p className="text-sm font-bold tracking-wide text-teal-700 uppercase">
              Get started
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Create your account
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Set up your account to access your practice workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Full name
              </label>

              <div className="flex h-13 items-center gap-3 rounded-xl border border-slate-200 bg-[#edf3ff] px-4 transition focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/10">
                <UserRound size={19} className="shrink-0 text-slate-400" />

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  required
                  minLength={2}
                  disabled={isLoading}
                  className="h-full w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Work email address
              </label>

              <div className="flex h-13 items-center gap-3 rounded-xl border border-slate-200 bg-[#edf3ff] px-4 transition focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/10">
                <Mail size={19} className="shrink-0 text-slate-400" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  className="h-full w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="flex h-13 items-center gap-3 rounded-xl border border-slate-200 bg-[#edf3ff] px-4 transition focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/10">
                <LockKeyhole size={19} className="shrink-0 text-slate-400" />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="h-full w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="shrink-0 text-slate-400 transition hover:text-teal-700"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Use at least 8 characters.
              </p>
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Confirm password
              </label>

              <div className="flex h-13 items-center gap-3 rounded-xl border border-slate-200 bg-[#edf3ff] px-4 transition focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/10">
                <LockKeyhole size={19} className="shrink-0 text-slate-400" />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="h-full w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="shrink-0 text-slate-400 transition hover:text-teal-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* API error */}
            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {/* Registration success */}
            {success && (
              <div
                role="status"
                className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3"
              >
                <p className="text-sm text-teal-800">{success}</p>

                <Link
                  href="/login"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-teal-800 hover:text-teal-950"
                >
                  Continue to sign in
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#008577] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#007468] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Creating account..." : "Create account"}

              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-6 flex items-start justify-center gap-2 text-center text-xs leading-5 text-slate-400">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <p>Your practice workspace is for authorized staff only.</p>
          </div>

          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-teal-700 transition hover:text-teal-800"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-8 text-center text-xs text-slate-400">
            © 2026 CareSync Practice
          </p>
        </div>
      </section>
    </main>
  );
}
