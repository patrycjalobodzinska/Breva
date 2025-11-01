import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

// UWAGA: RGB zostało USUNIĘTE z API zgodnie z FRONTEND_RECOMMENDATIONS.md
const lidarCaptureSchema = z.object({
  side: z.enum(["left", "right"]),
  measurementId: z.string(),
  background: z.object({
    depth: z.string(), // Base64 encoded depth map (uint16 array)
    timestamp: z.string(), // ISO 8601 format
  }),
  object: z.object({
    depth: z.string(), // Base64 encoded depth map (uint16 array)
    mask: z.string(), // JSON string with points array [{"x": number, "y": number}, ...]
    timestamp: z.string(), // ISO 8601 format
  }),
  cameraIntrinsics: z.object({
    fx: z.number(),
    fy: z.number(),
    cx: z.number(),
    cy: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  metadata: z.object({
    deviceModel: z.string(),
    iosVersion: z.string().optional(),
    appVersion: z.string().optional(),
  }),
});

interface VolumeEstimationStatus {
  requestId: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  estimatedVolume?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Waliduj dane wejściowe
    const data = lidarCaptureSchema.parse(req.body);

    // Sprawdź czy pomiar należy do użytkownika
    const measurement = await prisma.measurement?.findFirst({
      where: {
        id: data.measurementId,
        userId: session.user.id,
      },
    });

    if (!measurement) {
      return res.status(404).json({ error: "Pomiar nie został znaleziony" });
    }

    console.log("📱 LiDAR Capture Request:");
    console.log("📱 Side:", data.side);
    console.log("📱 Measurement ID:", data.measurementId);
    console.log("📱 Background Depth size:", data.background.depth.length);
    console.log("📱 Background Timestamp:", data.background.timestamp);
    console.log("📱 Object Depth size:", data.object.depth.length);
    console.log("📱 Mask size:", data.object.mask.length);
    console.log("📱 Object Timestamp:", data.object.timestamp);
    console.log("📱 Camera Intrinsics:", data.cameraIntrinsics);
    console.log("📱 Device:", data.metadata.deviceModel);

    // Przygotuj dane dla Python API (konwersja do snake_case)
    const pythonPayload = {
      background: {
        depth: data.background.depth,
        timestamp: data.background.timestamp,
      },
      object: {
        depth: data.object.depth,
        mask: data.object.mask,
        timestamp: data.object.timestamp,
      },
      camera_intrinsics: {
        fx: data.cameraIntrinsics.fx,
        fy: data.cameraIntrinsics.fy,
        cx: data.cameraIntrinsics.cx,
        cy: data.cameraIntrinsics.cy,
        width: data.cameraIntrinsics.width,
        height: data.cameraIntrinsics.height,
      },
      metadata: {
        device_model: data.metadata.deviceModel,
      },
    };

    // Wyślij do backendu Python
    const backendUrl = process.env.BACKEND_URL || 'https://breva-ai-dvf4dcgrcag9fvff.polandcentral-01.azurewebsites.net';

    console.log("📤 Sending to Python backend:", backendUrl);

    const pythonResponse = await fetch(`${backendUrl}/enqueue-volume-estimation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pythonPayload),
    });

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      console.error('❌ Python Backend Error:', pythonResponse.status, errorText);

      let pythonError;
      try {
        pythonError = JSON.parse(errorText);
      } catch {
        pythonError = errorText;
      }

      return res.status(pythonResponse.status).json({
        success: false,
        error: `Python Backend Error (${pythonResponse.status}): ${pythonResponse.statusText}`,
        details: pythonError,
        source: 'Python Backend',
        backendUrl: backendUrl
      });
    }

    const pythonResult = await pythonResponse.json();
    console.log("✅ Python Backend response:", pythonResult);

    // Zapisz capture jako PENDING z request_id z Pythona
    const captureRecord = await prisma.lidarCapture?.create({
      data: {
        measurementId: data.measurementId,
        side: data.side.toUpperCase(),
        requestId: pythonResult.request_id,
        status: "PENDING",
        metadata: {
          deviceModel: data.metadata.deviceModel,
          iosVersion: data.metadata.iosVersion,
          appVersion: data.metadata.appVersion,
          cameraIntrinsics: data.cameraIntrinsics,
        },
      },
    });

    // Start polling dla statusu volume estimation
    pollVolumeEstimation(
      pythonResult.request_id,
      data.measurementId,
      data.side
    );

    const response = {
      success: true,
      message: "LiDAR data sent to Python backend for processing",
      captureId: captureRecord?.id,
      requestId: pythonResult.request_id,
      side: data.side,
      measurementId: data.measurementId,
      status: pythonResult.status || "pending",
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(response);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("❌ Validation error:", error.errors);
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return res.status(400).json({
        error: `Next.js Validation Error: ${errorMessages}`,
        validationErrors: error.errors
      });
    }

    console.error("❌ Error processing LiDAR data:", error);

    return res.status(500).json({
      success: false,
      message: `Next.js Server Error: ${error?.message || "Failed to process LiDAR data"}`,
      side: "",
      measurementId: "",
      timestamp: new Date().toISOString(),
    });
  }
}

// Funkcja do polling statusu z Python API
async function pollVolumeEstimation(
  requestId: number,
  measurementId: string,
  side: string
) {
  const pythonApiUrl = process.env.PYTHON_API_URL || "http://localhost:8000";
  const maxAttempts = 60; // 5 minut z interwałem 5 sekund
  let attempts = 0;

  const pollInterval = setInterval(async () => {
    try {
      attempts++;

      const statusResponse = await fetch(
        `${pythonApiUrl}/volume-estimation/${requestId}`
      );

      if (!statusResponse.ok) {
        console.error(`❌ Failed to fetch status for request ${requestId}`);
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          await updateCaptureStatus(requestId, "FAILED");
        }
        return;
      }

      const statusData: VolumeEstimationStatus = await statusResponse.json();
      console.log(
        `🔍 Status check ${attempts}/${maxAttempts} for request ${requestId}:`,
        statusData.status
      );

      // Aktualizuj status w bazie danych
      await updateCaptureStatus(
        requestId,
        statusData.status,
        statusData.estimatedVolume
      );

      if (statusData.status === "COMPLETED" && statusData.estimatedVolume) {
        // Zapisz wynik do analizy piersi
        await saveVolumeResult(measurementId, side, statusData.estimatedVolume);
        clearInterval(pollInterval);
        console.log(
          `✅ Volume estimation completed for ${side} breast: ${statusData.estimatedVolume}ml`
        );
      } else if (statusData.status === "FAILED" || attempts >= maxAttempts) {
        clearInterval(pollInterval);
        console.log(`❌ Volume estimation failed for request ${requestId}`);
      }
    } catch (error) {
      console.error(`❌ Error polling status for request ${requestId}:`, error);
      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        await updateCaptureStatus(requestId, "FAILED");
      }
    }
  }, 5000); // Poll co 5 sekund
}

// Aktualizuj status capture w bazie danych
async function updateCaptureStatus(
  requestId: number,
  status: string,
  estimatedVolume?: number
) {
  try {
    await prisma.lidarCapture?.updateMany({
      where: { requestId },
      data: {
        status,
        estimatedVolume,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("❌ Error updating capture status:", error);
  }
}

// Zapisz wynik objętości do analizy piersi
async function saveVolumeResult(
  measurementId: string,
  side: string,
  volume: number
) {
  try {
    // Upewnij się że side jest lowercase dla kluczy bazy danych
    const sideKey = side.toLowerCase();

    // Sprawdź czy analiza AI już istnieje dla tego pomiaru
    const existingAnalysis = await prisma.breastAnalysis?.findUnique({
      where: {
        aiMeasurementId: measurementId,
      },
    });

    if (existingAnalysis) {
      // Aktualizuj istniejącą analizę AI
      const updateData: any = {};
      updateData[`${sideKey}VolumeMl`] = volume;
      updateData[`${sideKey}Confidence`] = 0.95;

      await prisma.breastAnalysis?.update({
        where: { id: existingAnalysis.id },
        data: updateData,
      });
      console.log(`💾 Updated AI analysis: ${sideKey} breast = ${volume}ml`);
    } else {
      // Utwórz nową analizę AI
      const createData: any = {
        aiMeasurementId: measurementId,
      };
      createData[`${sideKey}VolumeMl`] = volume;
      createData[`${sideKey}Confidence`] = 0.95;

      await prisma.breastAnalysis?.create({
        data: createData,
      });
      console.log(`💾 Created AI analysis: ${sideKey} breast = ${volume}ml`);
    }
  } catch (error) {
    console.error("❌ Error saving volume result:", error);
  }
}
