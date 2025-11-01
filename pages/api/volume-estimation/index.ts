import type { NextApiRequest, NextApiResponse } from 'next';
import { VolumeEstimationRequest, VolumeEstimationResponse } from '@/types/volume-estimation';
import { validateVolumeEstimationRequest } from '@/utils/validation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VolumeEstimationResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Walidacja danych
    const data: VolumeEstimationRequest = req.body;

    // Sprawdź wymagane pola
    if (!validateVolumeEstimationRequest(data)) {
      return res.status(400).json({ error: 'Invalid request data format' });
    }

    // Dodatkowa walidacja mask
    try {
      const maskPoints = JSON.parse(data.object.mask);
      if (!Array.isArray(maskPoints) || maskPoints.length === 0) {
        return res.status(400).json({ error: 'Invalid mask format' });
      }
    } catch {
      return res.status(400).json({ error: 'Invalid mask JSON format' });
    }

    // Wyślij do backendu Python
    const backendUrl = process.env.BACKEND_URL || 'https://breva-ai-dvf4dcgrcag9fvff.polandcentral-01.azurewebsites.net';

    console.log('Sending request to backend:', backendUrl);
    console.log('Request data:', {
      background: {
        depthLength: data.background.depth.length,
        timestamp: data.background.timestamp
      },
      object: {
        depthLength: data.object.depth.length,
        maskLength: data.object.mask.length,
        timestamp: data.object.timestamp
      },
      cameraIntrinsics: data.camera_intrinsics,
      metadata: data.metadata
    });

    const response = await fetch(`${backendUrl}/enqueue-volume-estimation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return res.status(response.status).json({
        error: `Backend error: ${response.statusText}`
      });
    }

    const result: VolumeEstimationResponse = await response.json();
    console.log('Backend response:', result);

    return res.status(200).json(result);

  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
