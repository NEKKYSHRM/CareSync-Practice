
import type {
  Patient,
  CreatePatientPayload,
  UpdatePatientPayload,
  PatientListParams,
} from "@/app/types/lookup/patient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getPatientsUrl(): string {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  return `${API_BASE_URL.replace(/\/$/, "")}/patients`;
}

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorData = await response.json();
      message = errorData.detail ?? message;
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const patientApi = {
  create: (payload: CreatePatientPayload): Promise<Patient> =>
    request<Patient>(getPatientsUrl(), {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  list: (params: PatientListParams = {}): Promise<Patient[]> => {
    const searchParams = new URLSearchParams();

    if (params.skip !== undefined) {
      searchParams.set("skip", String(params.skip));
    }

    if (params.limit !== undefined) {
      searchParams.set("limit", String(params.limit));
    }

    if (params.active_only !== undefined) {
      searchParams.set("active_only", String(params.active_only));
    }

    const query = searchParams.toString();
    const url = query
      ? `${getPatientsUrl()}?${query}`
      : getPatientsUrl();

    return request<Patient[]>(url);
  },

  getById: (patientId: string): Promise<Patient> =>
    request<Patient>(
      `${getPatientsUrl()}/${encodeURIComponent(patientId)}`,
    ),

  update: (
    patientId: string,
    payload: UpdatePatientPayload,
  ): Promise<Patient> =>
    request<Patient>(
      `${getPatientsUrl()}/${encodeURIComponent(patientId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),

  delete: (patientId: string): Promise<void> =>
    request<void>(
      `${getPatientsUrl()}/${encodeURIComponent(patientId)}`,
      {
        method: "DELETE",
      },
    ),
};
