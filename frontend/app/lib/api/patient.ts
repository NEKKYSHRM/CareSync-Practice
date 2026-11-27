import type {
  Patient,
  CreatePatientPayload,
  UpdatePatientPayload,
  PatientListParams,
  PaginatedResponse,
} from "@/app/types/lookup/patient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getPatientsUrl(): string {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  return `${API_BASE_URL.replace(/\/+$/, "")}/patients`;
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
      const detail = errorData?.detail;

      message =
        typeof detail === "string"
          ? detail
          : detail
            ? JSON.stringify(detail)
            : message;
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
    request<Patient>(`${getPatientsUrl()}/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  list: (
    params: PatientListParams = {},
  ): Promise<PaginatedResponse<Patient>> => {
    const searchParams = new URLSearchParams();

    searchParams.set("page", String(params.page ?? 1));
    searchParams.set("page_size", String(params.page_size ?? 10));

    if (params.patient_id?.trim()) {
      searchParams.set("patient_id", params.patient_id.trim());
    }

    if (params.name?.trim()) {
      searchParams.set("name", params.name.trim());
    }

    if (params.gender) {
      searchParams.set("gender", params.gender);
    }

    if (params.blood_group?.trim()) {
      searchParams.set("blood_group", params.blood_group.trim());
    }

    if (params.active !== undefined && params.active !== null) {
      searchParams.set("active", String(params.active));
    }

    if (params.created_order) {
      searchParams.set("created_order", params.created_order);
    }

    return request<PaginatedResponse<Patient>>(
      `${getPatientsUrl()}/list?${searchParams.toString()}`,
    );
  },

  getById: (patientId: string): Promise<Patient> =>
    request<Patient>(
      `${getPatientsUrl()}/detail/${encodeURIComponent(patientId)}`,
    ),

  update: (
    patientId: string,
    payload: UpdatePatientPayload,
  ): Promise<Patient> =>
    request<Patient>(
      `${getPatientsUrl()}/update/${encodeURIComponent(patientId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    ),

  delete: (patientId: string): Promise<void> =>
    request<void>(
      `${getPatientsUrl()}/delete/${encodeURIComponent(patientId)}`,
      {
        method: "DELETE",
      },
    ),
};
