import { VolumeEstimationRequest, MaskPoint } from '@/types/volume-estimation';

export function validateVolumeEstimationRequest(
  data: any
): data is VolumeEstimationRequest {
  // Sprawdź strukturę
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Background
  if (!data.background?.depth || !data.background?.timestamp) {
    return false;
  }

  // Object
  if (!data.object?.depth || !data.object?.mask || !data.object?.timestamp) {
    return false;
  }

  // Camera intrinsics
  const ci = data.camera_intrinsics;
  if (!ci ||
      typeof ci.fx !== 'number' ||
      typeof ci.fy !== 'number' ||
      typeof ci.cx !== 'number' ||
      typeof ci.cy !== 'number' ||
      typeof ci.width !== 'number' ||
      typeof ci.height !== 'number') {
    return false;
  }

  // Metadata
  if (!data.metadata?.device_model || typeof data.metadata.device_model !== 'string') {
    return false;
  }

  // Walidacja mask
  try {
    const maskPoints: MaskPoint[] = JSON.parse(data.object.mask);
    if (!Array.isArray(maskPoints) || maskPoints.length === 0) {
      return false;
    }

    // Sprawdź strukturę punktów
    for (const point of maskPoints) {
      if (typeof point.x !== 'number' || typeof point.y !== 'number') {
        return false;
      }
    }
  } catch {
    return false;
  }

  return true;
}
