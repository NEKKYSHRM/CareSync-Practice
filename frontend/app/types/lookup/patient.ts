
export type PatientGender = "M" | "F" | "O" | "NA";

export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export interface PatientName {
  first_name: string;
  middle_name?: string | null;
  last_name?: string | null;
}

export interface PatientAddress {
  line?: string | null;
  city?: string | null;
  state?: string | null;
  pin?: string | null;
}

export interface DateTimeInfo {
  date: string;
  time?: string;
}

export interface StatusHistory {
  status?: string | null;
  date: DateTimeInfo;
}

export interface CurrentStatus {
  status?: string | null;
  date: DateTimeInfo;
}

export interface PatientHeader {
  patient_id: string;
  date_created: DateTimeInfo;
  current_status: CurrentStatus;
  status_history: StatusHistory[];
}

export interface Patient {
  header_section: PatientHeader;
  patient_name: PatientName;
  mobile_number?: string | null;
  email?: string | null;
  dob?: string | null;
  gender: PatientGender;
  blood_group?: string | null;
  address: PatientAddress;
  active: boolean;
}

export interface CreatePatientPayload {
  patient_name: PatientName;
  mobile_number?: string | null;
  email?: string | null;
  dob?: string | null;
  gender?: PatientGender;
  blood_group?: string | null;
  address?: PatientAddress;
  active?: boolean;
}

export interface UpdatePatientPayload {
  patient_name?: PatientName;
  mobile_number?: string | null;
  email?: string | null;
  dob?: string | null;
  gender?: PatientGender;
  blood_group?: string | null;
  address?: PatientAddress;
  active?: boolean;
}

export type PatientListParams = {
  page?: number;
  page_size?: 5 | 10 | 25 | 50 | 100;
  patient_id?: string;
  name?: string;
  gender?: PatientGender;
  blood_group?: string;
  active?: boolean | null;
  created_order?: "asc" | "desc";
};

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}
