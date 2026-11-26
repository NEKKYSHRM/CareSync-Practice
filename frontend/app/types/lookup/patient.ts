
export type PatientGender = "M" | "F" | "O" | "NA";

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

export interface PatientListParams {
  skip?: number;
  limit?: number;
  active_only?: boolean;
}
