
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HeartPulse,
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  BriefcaseMedical,
  CreditCard,
  MessageSquare,
  UserRoundCog,
  ChartNoAxesCombined,
  Package,
  Settings,
  ChevronDown,
  Plus,
  UserPlus,
  Send,
  FilePlus,
} from "lucide-react";

const navigationItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Appointments", href: "/appointments", icon: CalendarDays },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Doctors", href: "/doctors", icon: Stethoscope },
  { label: "Services", href: "/services", icon: BriefcaseMedical },
  { label: "Billing & Payments", href: "/billing", icon: CreditCard },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Staff", href: "/staff", icon: UserRoundCog },
  {
    label: "Reports & Analytics",
    href: "/reports",
    icon: ChartNoAxesCombined,
  },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-dvh w-[240px] shrink-0 flex-col overflow-hidden border-r border-[#DCEBE9] bg-white">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex h-[76px] shrink-0 items-center gap-3 border-b border-[#E5EFEE] px-6"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00C9B1] text-[#003B3B]">
          <HeartPulse className="h-6 w-6" strokeWidth={2.2} />
        </div>

        <div>
          <h1 className="text-[18px] font-bold tracking-tight text-[#003B3B]">
            CareSync<span className="text-[#00A995]">.</span>
          </h1>
          <p className="text-[9px] font-semibold uppercase tracking-[2px] text-[#527674]">
            Practice
          </p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors ${
                isActive
                  ? "bg-[#003B3B] text-white shadow-sm"
                  : "text-[#344F4D] hover:bg-[#EAF7F5] hover:text-[#003B3B]"
              }`}
            >
              <Icon
                className={`h-4.25 w-4.25 shrink-0 ${
                  isActive ? "text-[#00C9B1]" : ""
                }`}
                strokeWidth={1.8}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Clinic owner profile */}
      {/* <div className="shrink-0 px-3 pb-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border border-[#DDEDEA] bg-[#F0F9F8] p-3 text-left transition hover:bg-[#E4F5F2]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#CFF7F0] text-[#00564F]">
            <UserRoundCog className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-[#003B3B]">
              Clinic Owner
            </p>
            <p className="mt-0.5 text-[10px] text-[#66817F]">
              Practice Admin
            </p>
          </div>

          <ChevronDown className="h-4 w-4 shrink-0 text-[#527674]" />
        </button>
      </div> */}

      {/* Quick actions */}
      <div className="shrink-0 px-3 pb-4">
        <div className="rounded-xl border border-[#DCEBE9] bg-white p-3">
          <h2 className="mb-3 px-1 text-xs font-semibold text-[#003B3B]">
            Quick Actions
          </h2>

          <div className="space-y-1.5">
            <Link
              href="/appointments"
              className="flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#007F73] px-2 py-2 text-[11px] font-semibold text-white transition hover:bg-[#003B3B]"
            >
              <Plus className="h-3.5 w-3.5" />
              New Appointment
            </Link>

            <Link
              href="/patients"
              className="flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[#D5E7E4] bg-white px-2 py-2 text-[11px] font-medium text-[#244D49] transition hover:border-[#00A995] hover:bg-[#F0F9F8]"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add Patient
            </Link>

            <Link
              href="/messages"
              className="flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[#D5E7E4] bg-white px-2 py-2 text-[11px] font-medium text-[#244D49] transition hover:border-[#00A995] hover:bg-[#F0F9F8]"
            >
              <Send className="h-3.5 w-3.5" />
              Send Message
            </Link>

            <Link
              href="/billing"
              className="flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[#D5E7E4] bg-white px-2 py-2 text-[11px] font-medium text-[#244D49] transition hover:border-[#00A995] hover:bg-[#F0F9F8]"
            >
              <FilePlus className="h-3.5 w-3.5" />
              Create Invoice
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
