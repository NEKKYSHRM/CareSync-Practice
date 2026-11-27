"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleUserRound,
  ClipboardList,
  Filter,
  LoaderCircle,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { INDIAN_STATES_AND_UTS } from "@/app/lib/utils/indian-states";
import { patientApi } from "@/app/lib/api/patient";
import type {
  CreatePatientPayload,
  Patient,
  PatientGender,
} from "@/app/types/lookup/patient";
import DataPagination from "@/app/components/ui/table-pagination";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

const EMPTY_FORM = {
  first_name: "",
  middle_name: "",
  last_name: "",
  mobile_number: "",
  email: "",
  dob: "",
  gender: "NA" as PatientGender,
  blood_group: "",
  address_line: "",
  city: "",
  state: "",
  pin: "",
};

function getPatientName(patient: Patient): string {
  const name = patient.patient_name;

  return [name.first_name, name.middle_name, name.last_name]
    .filter(Boolean)
    .join(" ");
}

function getInitials(patient: Patient): string {
  const name = patient.patient_name;

  return [name.first_name, name.last_name]
    .filter(Boolean)
    .map((part) => part!.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const [showRegistration, setShowRegistration] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await patientApi.list({
        page: 1,
        page_size: 100,
        active: null,
      });

      setPatients(result.items);
      setPage(1);
    } catch (err) {
      setPatients([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  const filteredPatients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return patients.filter((patient) => {
      const name = getPatientName(patient).toLowerCase();
      const patientId = patient.header_section.patient_id.toLowerCase();
      const mobile = patient.mobile_number ?? "";
      const email = patient.email?.toLowerCase() ?? "";

      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        patientId.includes(normalizedSearch) ||
        mobile.includes(normalizedSearch) ||
        email.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && patient.active) ||
        (statusFilter === "inactive" && !patient.active);

      return matchesSearch && matchesStatus;
    });
  }, [patients, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));

  const visiblePatients = filteredPatients.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const activeCount = patients.filter((patient) => patient.active).length;
  const inactiveCount = patients.length - activeCount;

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  function updateField(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function openRegistration() {
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setShowRegistration(true);
  }

  async function handleRegistration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const mobile = form.mobile_number.trim();
    const pin = form.pin.trim();

    if (!/^\d{10}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (pin && !/^\d{6}$/.test(pin)) {
      setError("PIN code must contain exactly 6 digits.");
      return;
    }

    if (form.dob && form.dob > new Date().toISOString().slice(0, 10)) {
      setError("Date of birth cannot be in the future.");
      return;
    }

    const payload: CreatePatientPayload = {
      patient_name: {
        first_name: form.first_name.trim(),
        middle_name: form.middle_name.trim() || null,
        last_name: form.last_name.trim() || null,
      },
      mobile_number: mobile,
      email: form.email.trim() || null,
      dob: form.dob || null,
      gender: form.gender,
      blood_group: form.blood_group || null,
      address: {
        line: form.address_line.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        pin: pin || null,
      },
    };

    setSubmitting(true);

    try {
      const createdPatient = await patientApi.create(payload);

      setPatients((previous) => [createdPatient, ...previous]);
      setShowRegistration(false);
      setForm(EMPTY_FORM);
      setSearch("");
      setStatusFilter("all");
      setPage(1);
      setSuccess(
        `Patient ${createdPatient.header_section.patient_id} registered successfully.`,
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(patient: Patient) {
    const patientId = patient.header_section.patient_id;

    const confirmed = window.confirm(
      `Permanently delete ${getPatientName(patient)} (${patientId})? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(patientId);

    try {
      await patientApi.delete(patientId);

      setPatients((previous) =>
        previous.filter((item) => item.header_section.patient_id !== patientId),
      );

      setSelectedPatient(null);
      setSuccess("Patient deleted successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  const MIN_TABLE_ROWS = 10;
  const TABLE_ROW_HEIGHT = 44; // pixels

  return (
    <div className="min-h-full bg-[#f4f8f8] px-5 py-7 text-slate-800 sm:px-7 lg:px-9">
      {/* Page heading */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#063f3c] sm:text-3xl">
            Patients
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your patient directory and medical records.
          </p>
        </div>

        <button
          type="button"
          onClick={openRegistration}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#008577] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#006f65] focus:outline-none focus:ring-4 focus:ring-teal-100"
        >
          <Plus size={18} />
          Register Patient
        </button>
      </div>

      {/* Notifications */}
      {error && !showRegistration && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p className="flex-1">{error}</p>
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800"
        >
          <Check size={19} className="mt-0.5 shrink-0" />
          <p className="flex-1">{success}</p>
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setSuccess("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <section className="overflow-hidden rounded-2xl border border-[#dce9e8] bg-white shadow-sm">
          {/* Patient toolbar: Refresh left, search and filter right */}
          <div className="flex flex-col gap-3 border-b border-slate-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            {/* Left: Refresh */}
            <button
              type="button"
              onClick={() => void loadPatients()}
              disabled={loading}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            {/* Right: Search and status filter */}
            <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
              {/* Search */}
              <div className="relative min-w-0 flex-1 sm:max-w-md">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, patient ID, mobile or email..."
                  aria-label="Search patients"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#008577] focus:ring-2 focus:ring-teal-50"
                />
              </div>

              {/* Filter */}
              <div className="relative w-36 shrink-0 sm:w-44">
                <Filter
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter patients by status"
                  className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm outline-none transition focus:border-[#008577] focus:ring-2 focus:ring-teal-50"
                >
                  <option value="all">All patients</option>
                  <option value="active">Active only</option>
                  <option value="inactive">Inactive only</option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#dce9e8] bg-white shadow-sm">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-212.5 border-collapse text-left">
              <thead>
                <tr className="bg-[#f7faf9] text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 text-left">Patient ID</th>
                  <th className="px-5 py-3 text-left">Patient</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Date of Birth</th>
                  <th className="px-5 py-4">Gender</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody
                className="divide-y divide-slate-100"
                style={{ height: `${MIN_TABLE_ROWS * TABLE_ROW_HEIGHT}px` }}
              >
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <LoaderCircle
                        size={28}
                        className="mx-auto animate-spin text-[#008577]"
                      />
                      <p className="mt-3 text-sm text-slate-500">
                        Loading patients...
                      </p>
                    </td>
                  </tr>
                ) : visiblePatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-[#008577]">
                        <Users size={26} />
                      </div>
                      <h3 className="mt-4 font-semibold text-slate-800">
                        {search || statusFilter !== "all"
                          ? "No matching patients"
                          : "No patients registered yet"}
                      </h3>
                      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                        {search || statusFilter !== "all"
                          ? "Try changing your search or filters."
                          : "Register your first patient to start building your clinic directory."}
                      </p>
                      {!search && statusFilter === "all" && (
                        <button
                          type="button"
                          onClick={openRegistration}
                          className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#008577] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#006f65]"
                        >
                          <UserPlus size={16} />
                          Register first patient
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  visiblePatients.map((patient) => {
                    const patientId = patient.header_section.patient_id;
                    const isSelected = selectedPatient === patientId;

                    return (
                      <tr
                        key={patientId}
                        className="transition hover:bg-[#f8fbfa]"
                      >
                        <td className="px-5 py-1">
                          <span className="whitespace-nowrap font-mono text-xs text-slate-600">
                            {patientId}
                          </span>
                        </td>

                        <td className="px-5 py-1">
                          <div className="flex items-center gap-3">
                            <div className="min-w-0">
                              <p className="max-w-56 truncate text-xs font-semibold text-slate-800">
                                {getPatientName(patient)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-1">
                          <div className="flex flex-col gap-1.5">
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                              <Phone
                                size={13}
                                className="shrink-0 text-slate-400"
                              />
                              {patient.mobile_number || "Not provided"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-1">
                          <span className="inline-flex items-center gap-2 text-xs text-slate-600">
                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />
                            {formatDate(patient.dob)}
                          </span>
                        </td>

                        <td className="px-5 py-1">
                          <span className="text-xs text-slate-600">
                            {{
                              M: "Male",
                              F: "Female",
                              O: "Other",
                              NA: "N/A",
                            }[patient.gender] ?? "N/A"}
                          </span>
                        </td>

                        <td className="px-5 py-1">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              patient.active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                patient.active
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {patient.active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-5 py-1 text-right">
                          <div className="relative inline-block">
                            <button
                              type="button"
                              aria-label={`Actions for ${getPatientName(patient)}`}
                              aria-expanded={isSelected}
                              onClick={() =>
                                setSelectedPatient(
                                  isSelected ? null : patientId,
                                )
                              }
                              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                            >
                              <MoreHorizontal size={19} />
                            </button>

                            {isSelected && (
                              <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPatient(null);
                                    setSuccess(`Patient ID: ${patientId}`);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <ClipboardList size={15} />
                                  Show patient ID
                                </button>

                                <button
                                  type="button"
                                  disabled={deletingId === patientId}
                                  onClick={() => void handleDelete(patient)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                                >
                                  {deletingId === patientId ? (
                                    <LoaderCircle
                                      size={15}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2 size={15} />
                                  )}
                                  Delete patient
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
                {!loading &&
                  visiblePatients.length > 0 &&
                  Array.from({
                    length: Math.max(
                      0,
                      MIN_TABLE_ROWS - visiblePatients.length,
                    ),
                  }).map((_, index) => (
                    <tr key={`placeholder-${index}`} className="h-11">
                      <td colSpan={7} className="px-5 py-1">
                        {" "}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <DataPagination
            page={page}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            totalItems={filteredPatients.length}
            loading={loading}
            onPageChange={(nextPage) => setPage(nextPage)}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPage(1);
            }}
          />
        </section>
      </div>

      {/* Registration modal */}
      {showRegistration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-[2px] sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              setShowRegistration(false);
              setError("");
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-patient-title"
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-[#008577]">
                  <UserPlus size={22} />
                </div>
                <div>
                  <h2
                    id="register-patient-title"
                    className="text-lg font-bold text-[#063f3c]"
                  >
                    Register New Patient
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Enter the patient&apos;s details below.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={submitting}
                aria-label="Close registration form"
                onClick={() => {
                  setShowRegistration(false);
                  setError("");
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegistration} className="overflow-y-auto">
              <div className="space-y-7 px-5 py-6 sm:px-7">
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <CircleUserRound size={18} className="text-[#008577]" />
                    <h3 className="font-semibold text-slate-800">
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="First Name" required>
                      <input
                        required
                        maxLength={100}
                        value={form.first_name}
                        onChange={(event) =>
                          updateField("first_name", event.target.value)
                        }
                        placeholder="Enter first name"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Middle Name">
                      <input
                        maxLength={100}
                        value={form.middle_name}
                        onChange={(event) =>
                          updateField("middle_name", event.target.value)
                        }
                        placeholder="Enter middle name"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Last Name">
                      <input
                        maxLength={100}
                        value={form.last_name}
                        onChange={(event) =>
                          updateField("last_name", event.target.value)
                        }
                        placeholder="Enter last name"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Date of Birth">
                      <input
                        type="date"
                        max={new Date().toISOString().slice(0, 10)}
                        value={form.dob}
                        onChange={(event) =>
                          updateField("dob", event.target.value)
                        }
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Gender">
                      <select
                        value={form.gender}
                        onChange={(event) =>
                          updateField("gender", event.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="NA">Prefer not to specify</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </FormField>

                    <FormField label="Blood Group">
                      <select
                        value={form.blood_group}
                        onChange={(event) =>
                          updateField("blood_group", event.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="">Not specified</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                          (group) => (
                            <option key={group} value={group}>
                              {group}
                            </option>
                          ),
                        )}
                      </select>
                    </FormField>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Phone size={18} className="text-[#008577]" />
                    <h3 className="font-semibold text-slate-800">
                      Contact Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Mobile Number" required>
                      <input
                        type="tel"
                        required
                        inputMode="numeric"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        value={form.mobile_number}
                        onChange={(event) =>
                          updateField(
                            "mobile_number",
                            event.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                        placeholder="10-digit mobile number"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Email Address">
                      <input
                        type="email"
                        maxLength={254}
                        value={form.email}
                        onChange={(event) =>
                          updateField("email", event.target.value)
                        }
                        placeholder="patient@example.com"
                        className={inputClass}
                      />
                    </FormField>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <div className="mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-[#008577]" />
                    <h3 className="font-semibold text-slate-800">Address</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <FormField label="Address Line">
                        <input
                          maxLength={250}
                          value={form.address_line}
                          onChange={(event) =>
                            updateField("address_line", event.target.value)
                          }
                          placeholder="House no., street, locality"
                          className={inputClass}
                        />
                      </FormField>
                    </div>

                    <FormField label="City">
                      <input
                        maxLength={100}
                        value={form.city}
                        onChange={(event) =>
                          updateField("city", event.target.value)
                        }
                        placeholder="Enter city"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="State">
                      <select
                        name="state"
                        value={form.state}
                        onChange={(event) =>
                          updateField("state", event.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-[#D5E7E4] bg-white px-3 text-sm text-[#003B3B] outline-none transition focus:border-[#00A995] focus:ring-2 focus:ring-[#00A995]/20"
                      >
                        <option value="">Select state / UT</option>

                        {INDIAN_STATES_AND_UTS.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="PIN Code">
                      <input
                        inputMode="numeric"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        value={form.pin}
                        onChange={(event) =>
                          updateField(
                            "pin",
                            event.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        placeholder="6-digit PIN code"
                        className={inputClass}
                      />
                    </FormField>
                  </div>
                </div>

                <p className="text-xs leading-5 text-slate-500">
                  The backend generates the unique patient ID automatically when
                  the record is created.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setShowRegistration(false);
                    setError("");
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#008577] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#006f65] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Register Patient
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#008577] focus:ring-4 focus:ring-teal-50";

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
