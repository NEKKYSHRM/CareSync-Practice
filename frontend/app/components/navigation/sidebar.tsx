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
  Plus,
  UserPlus,
  Send,
  FilePlus,
  PanelLeftClose,
  PanelLeftOpen,
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

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      id="caresync-sidebar"
      className={`flex h-full min-h-0 w-full flex-col overflow-hidden border-r border-[#DCEBE9] bg-white ${
        isOpen ? "" : "items-center"
      }`}
    >
      {/* Sidebar header */}
      <div
        className={`group relative flex h-[76px] shrink-0 items-center border-b border-[#E5EFEE] ${
          isOpen ? "justify-between gap-2 px-4" : "justify-center px-2"
        }`}
      >
        <Link
          href="/dashboard"
          aria-label="CareSync dashboard"
          title={!isOpen ? "CareSync Practice" : undefined}
          className={`flex min-w-0 items-center ${
            isOpen ? "gap-3" : "justify-center"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00C9B1] text-[#003B3B]">
            <HeartPulse className="h-6 w-6" strokeWidth={2.2} />
          </div>

          {isOpen && (
            <div className="min-w-0">
              <h1 className="text-[18px] font-bold tracking-tight text-[#003B3B]">
                CareSync<span className="text-[#00A995}">.</span>
              </h1>
              <p className="text-[9px] font-semibold uppercase tracking-[2px] text-[#527674]">
                Practice
              </p>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={onToggle}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={isOpen}
          aria-controls="caresync-sidebar"
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#527674] transition-colors hover:bg-[#EAF7F5] hover:text-[#003B3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A995] ${
            isOpen
              ? ""
              : "absolute inset-0 z-10 h-full w-full rounded-none bg-white/95 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
          }`}
        >
          {isOpen ? (
            <PanelLeftClose size={19} strokeWidth={1.8} />
          ) : (
            <PanelLeftOpen size={19} strokeWidth={1.8} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className={`min-h-0 flex-1 space-y-1 overflow-y-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          isOpen ? "w-full px-3" : "w-full px-2"
        }`}
      >
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
              aria-label={!isOpen ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
              title={!isOpen ? item.label : undefined}
              className={`flex min-h-10 items-center rounded-lg py-2 text-[12px] font-medium transition-colors ${
                isOpen ? "gap-3 px-3" : "justify-center px-0"
              } ${
                isActive
                  ? "bg-[#003B3B] text-white shadow-sm"
                  : "text-[#344F4D] hover:bg-[#EAF7F5] hover:text-[#003B3B]"
              }`}
            >
              <Icon
                className={`h-[17px] w-[17px] shrink-0 ${
                  isActive ? "text-[#00C9B1]" : ""
                }`}
                strokeWidth={1.8}
              />

              {isOpen && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions — expanded sidebar only */}
      {isOpen && (
        <div className="w-full shrink-0 px-3 pb-4">
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
      )}
    </aside>
  );
}
