import { apiClient } from "@/lib/api-client";

export interface LidarCaptureStatus {
  captureId: string;
  requestId: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  estimatedVolume?: number;
  createdAt: string;
  updatedAt: string;
}

export const lidarService = {
  // GET /api/lidar-capture/status - status przetwarzania LiDAR
  getStatus: async (measurementId: string, side: "left" | "right") => {
    return apiClient.get<LidarCaptureStatus>(
      `/api/lidar-capture/status?measurementId=${encodeURIComponent(
        measurementId
      )}&side=${side}`
    );
  },
};
