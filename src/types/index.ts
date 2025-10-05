export interface User {
  id: string;
  email: string;
  name?: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface Measurement {
  id: string;
  name: string;
  note?: string;
  source: "AI" | "MANUAL";
  leftVolumeMl: number;
  rightVolumeMl: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  baselineId?: string;
  manualItems?: Measurement[];
}

export interface MeasurementFormData {
  name: string;
  note: string;
}

export interface ManualMeasurementFormData {
  leftVolumeMl: string;
  rightVolumeMl: string;
  name: string;
  note: string;
}

export interface EditManualFormData {
  leftVolumeMl: string;
  rightVolumeMl: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ChartData {
  name: string;
  left: number;
  right: number;
  date: string;
}

export interface MeasurementStats {
  asymmetry: string;
  accuracy?: {
    left: string;
    right: string;
  };
}
