export interface VolumeEstimationRequest {
  background: {
    depth: string;
    timestamp: string;
  };
  object: {
    depth: string;
    mask: string; // JSON string with points array
    timestamp: string;
  };
  camera_intrinsics: {
    fx: number;
    fy: number;
    cx: number;
    cy: number;
    width: number;
    height: number;
  };
  metadata: {
    device_model: string;
  };
}

export interface VolumeEstimationResponse {
  message: string;
  request_id: number;
  status: string;
}

export interface MaskPoint {
  x: number;
  y: number;
}
