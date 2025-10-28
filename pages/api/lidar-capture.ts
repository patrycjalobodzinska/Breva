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

const lidarCaptureSchema = z.object({
  side: z.enum(["left", "right"]),
  measurementId: z.string(),
  background: z.object({
    rgb: z.string(),
    depth: z.string(),
    timestamp: z.string(),
  }),
  object: z.object({
    rgb: z.string(),
    depth: z.string(),
    mask: z.string(),
    timestamp: z.string(),
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
    iosVersion: z.string(),
    appVersion: z.string(),
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
    console.log("📱 Background RGB size:", data.background.rgb.length);
    console.log("📱 Background Depth size:", data.background.depth.length);
    console.log("📱 Object RGB size:", data.object.rgb.length);
    console.log("📱 Object Depth size:", data.object.depth.length);
    console.log("📱 Mask size:", data.object.mask.length);
    console.log("📱 Device:", data.metadata.deviceModel);

    // Wyślij dane do Python API
    const pythonApiUrl = process.env.PYTHON_API_URL || "http://localhost:8000";

    const enqueueResponse = await fetch(
      `${pythonApiUrl}/enqueue-volume-estimation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          side: data.side,
          measurementId: data.measurementId,
          background: data.background,
          object: data.object,
          cameraIntrinsics: data.cameraIntrinsics,
          metadata: data.metadata,
        }),
      }
    );

    if (!enqueueResponse.ok) {
      throw new Error(`Python API error: ${enqueueResponse.status}`);
    }

    const enqueueResult = await enqueueResponse.json();
    console.log("🐍 Python API Enqueue Response:", enqueueResult);

    // Zapisz requestId do bazy danych
    const captureRecord = await prisma.lidarCapture?.create({
      data: {
        measurementId: data.measurementId,
        side: data.side.toUpperCase(),
        requestId: enqueueResult.requestId,
        status: "PENDING",
        metadata: {
          deviceModel: data.metadata.deviceModel,
          iosVersion: data.metadata.iosVersion,
          appVersion: data.metadata.appVersion,
          cameraIntrinsics: data.cameraIntrinsics,
        },
      },
    });

    // Rozpocznij polling w tle (nie blokuj odpowiedzi)
    pollVolumeEstimation(
      enqueueResult.requestId,
      data.measurementId,
      data.side
    );

    const response = {
      success: true,
      message: "LiDAR data received successfully",
      captureId: captureRecord?.id,
      requestId: enqueueResult.requestId,
      side: data.side,
      measurementId: data.measurementId,
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(response);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }

    console.error("❌ Error processing LiDAR data:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process LiDAR data",
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
    // Sprawdź czy analiza AI już istnieje
    const existingAnalysis = await prisma.breastAnalysis?.findFirst({
      where: {
        measurementId,
        measurementType: "AI",
      },
    });

    if (existingAnalysis) {
      // Aktualizuj istniejącą analizę AI
      await prisma.breastAnalysis?.update({
        where: { id: existingAnalysis.id },
        data: {
          [`${side}VolumeMl`]: volume,
          [`${side}Confidence`]: 0.95, // Mock confidence
        },
      });
    } else {
      // Utwórz nową analizę AI
      await prisma.breastAnalysis?.create({
        data: {
          measurementId,
          measurementType: "AI",
          [`${side}VolumeMl`]: volume,
          [`${side}Confidence`]: 0.95, // Mock confidence
        },
      });
    }

    console.log(`💾 Volume result saved: ${side} breast = ${volume}ml`);
  } catch (error) {
    console.error("❌ Error saving volume result:", error);
  }
}
