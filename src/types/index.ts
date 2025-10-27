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
  createdAt: string;
  updatedAt: string;
  userId: string;
  analyses?: BreastAnalysis[];
}

export interface BreastAnalysis {
  id: string;
  measurementId: string;
  measurementType: "AI" | "MANUAL";
  leftVolumeMl?: number;
  rightVolumeMl?: number;
  leftConfidence?: number;
  rightConfidence?: number;
  leftFilePath?: string;
  rightFilePath?: string;
  leftFileName?: string;
  rightFileName?: string;
  leftFileSize?: number;
  rightFileSize?: number;
  leftMimeType?: string;
  rightMimeType?: string;
  createdAt: string;
  updatedAt: string;
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

// Dashboard API types
export interface DashboardStats {
  measurements: {
    total: number;
    last7Days: number;
    ai: {
      total: number;
      last7Days: number;
    };
    manual: {
      total: number;
      last7Days: number;
    };
  };
  users: {
    total: number;
    last7Days: number;
  };
  dailyStats: {
    date: string;
    count: number;
  }[];
  averageVolume: {
    left: number;
    right: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}
