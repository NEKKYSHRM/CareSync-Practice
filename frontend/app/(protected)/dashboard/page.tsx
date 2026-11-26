"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { patientApi } from "@/app/lib/api/patient";
import type { Patient } from "@/app/types/lookup/patient";

type PatientStats = {
  total: number;
  active: number;
  inactive: number;
};

const INITIAL_STATS: PatientStats = {
  total: 0,
  active: 0,
  inactive: 0,
};

const PAGE_SIZE = 100;

export default function DashboardPage() {
  const [stats, setStats] = useState<PatientStats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPatientStats = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const allPatients: Patient[] = [];
      let skip = 0;

      while (true) {
        const patients = await patientApi.list({
          skip,
          limit: PAGE_SIZE,
          active_only: false,
        });

        allPatients.push(...patients);

        if (patients.length < PAGE_SIZE) {
          break;
        }

        skip += PAGE_SIZE;
      }

      const active = allPatients.filter(
        (patient) => patient.active,
      ).length;

      setStats({
        total: allPatients.length,
        active,
        inactive: allPatients.length - active,
      });
    } catch (err) {
      console.error("Failed to load dashboard patient statistics:", err);
      setError("Unable to load patient statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPatientStats();
  }, [loadPatientStats]);

  const cards = [
    {
      title: "Total Patients",
      value: stats.total,
      description: "All registered patients",
      icon: Users,
      iconBg: "bg-[#E5F5F2]",
      iconColor: "text-[#007F70]",
    },
    {
      title: "Active Patients",
      value: stats.active,
      description: "Currently active records",
      icon: UserCheck,
      iconBg: "bg-[#E7F7EC]",
      iconColor: "text-[#218344]",
    },
    {
      title: "Inactive Patients",
      value: stats.inactive,
      description: "Currently inactive records",
      icon: UserX,
      iconBg: "bg-[#FFF0E8]",
      iconColor: "text-[#C66A35]",
    },
  ];

  return (
    <main className="min-h-full bg-[#F0F9F8] p-3 sm:p-4 lg:p-5">
      <div className="mx-auto max-w-[1600px] space-y-5">
        {/* Compact page header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#003B3B] sm:text-2xl">
              Dashboard
            </h1>

            <p className="mt-1 text-xs text-[#66817F] sm:text-sm">
              Overview of your clinic&apos;s performance.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadPatientStats()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-[#D5E7E4] bg-white px-3 py-2 text-xs font-medium text-[#003B3B] transition hover:bg-[#F7FCFB] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto sm:text-sm"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-2 text-xs text-red-700 sm:text-sm">
              <AlertCircle size={16} />
              {error}
            </div>

            <button
              type="button"
              onClick={() => void loadPatientStats()}
              className="self-start text-xs font-semibold text-red-700 underline underline-offset-4 sm:self-auto sm:text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {/* Patient statistics */}
        <section
          aria-label="Patient statistics"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="rounded-xl border border-[#E0EEEB] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#66817F] sm:text-sm">
                      {card.title}
                    </p>

                    <p className="mt-1.5 text-2xl font-bold tracking-tight text-[#003B3B]">
                      {loading ? (
                        <span className="inline-block h-7 w-12 animate-pulse rounded-md bg-[#E5F1EF]" />
                      ) : (
                        card.value.toLocaleString("en-IN")
                      )}
                    </p>

                    <p className="mt-1 text-xs text-[#829895]">
                      {card.description}
                    </p>
                  </div>

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}
                  >
                    <Icon size={20} className={card.iconColor} />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Empty state */}
        {!loading && !error && stats.total === 0 && (
          <div className="rounded-xl border border-dashed border-[#C8DEDA] bg-white p-6 text-center">
            <Users
              size={26}
              className="mx-auto text-[#66817F]"
            />

            <h2 className="mt-2 text-sm font-semibold text-[#003B3B]">
              No patients yet
            </h2>

            <p className="mt-1 text-xs text-[#66817F]">
              Statistics will appear here after you register your first patient.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}