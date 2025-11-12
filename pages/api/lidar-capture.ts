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
    reference_point: z.string().optional(), // JSON string with {"x": number, "y": number, "z": number}
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
  // Obsługa CORS preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Cookie, Authorization"
    );
    return res.status(200).end();
  }

  // Logowanie dla diagnostyki
  console.log("📥 [LIDAR CAPTURE API] Received request:");
  console.log("📥 [LIDAR CAPTURE API] Method:", req.method);
  console.log("📥 [LIDAR CAPTURE API] URL:", req.url);
  console.log("📥 [LIDAR CAPTURE API] Headers:", {
    "content-type": req.headers["content-type"],
    "user-agent": req.headers["user-agent"],
    origin: req.headers["origin"],
  });

  if (req.method !== "POST") {
    console.error("❌ [LIDAR CAPTURE API] Method not allowed:", req.method);
    return res.status(405).json({
      error: "Method not allowed",
      allowedMethods: ["POST", "OPTIONS"],
      receivedMethod: req.method,
    });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Konwersja snake_case → camelCase (dla kompatybilności z Swift)
    const requestBody = req.body;

    // Normalizuj side (usuń puste stringi, użyj "left" jako domyślnego)
    let normalizedSide = requestBody.side;
    if (!normalizedSide || normalizedSide === "") {
      normalizedSide = "left"; // Domyślna wartość
    }
    normalizedSide = normalizedSide.toLowerCase();

    // Normalizuj measurementId (pusty string = undefined)
    const rawMeasurementId =
      requestBody.measurementId || requestBody.measurement_id;
    const normalizedMeasurementId =
      rawMeasurementId && rawMeasurementId.trim() !== ""
        ? rawMeasurementId
        : undefined;

    // Normalizuj reference_point z object
    const rawObject = requestBody.object || {};
    const rawReferencePoint =
      rawObject.referencePoint ||
      rawObject.reference_point ||
      requestBody.referencePoint ||
      requestBody.reference_point; // Fallback dla kompatybilności wstecznej

    let normalizedReferencePoint: string | undefined;
    if (rawReferencePoint) {
      // Jeśli jest już stringiem (JSON), użyj go bezpośrednio
      if (typeof rawReferencePoint === "string") {
        // Waliduj czy to poprawny JSON
        try {
          const parsed = JSON.parse(rawReferencePoint);
          if (
            parsed &&
            typeof parsed === "object" &&
            "x" in parsed &&
            "y" in parsed
          ) {
            // Akceptuj zarówno {x, y} jak i {x, y, z}
            normalizedReferencePoint = rawReferencePoint;
          }
        } catch {
          // Niepoprawny JSON, zignoruj
        }
      }
      // Jeśli jest obiektem, serializuj do JSON string
      else if (
        typeof rawReferencePoint === "object" &&
        "x" in rawReferencePoint &&
        "y" in rawReferencePoint
      ) {
        const parsedReferencePoint: any = {
          x: Number(rawReferencePoint.x),
          y: Number(rawReferencePoint.y),
        };

        // Dodaj z tylko jeśli jest podane
        if ("z" in rawReferencePoint) {
          parsedReferencePoint.z = Number(rawReferencePoint.z);
        }

        if (
          Object.values(parsedReferencePoint).every(
            (value) => typeof value === "number" && !Number.isNaN(value)
          )
        ) {
          normalizedReferencePoint = JSON.stringify(parsedReferencePoint);
        }
      }
    }

    const normalizedBody: any = {
      side: normalizedSide,
      measurementId: normalizedMeasurementId,
      background: requestBody.background,
      object: {
        ...rawObject,
        reference_point: normalizedReferencePoint,
      },
      cameraIntrinsics:
        requestBody.cameraIntrinsics || requestBody.camera_intrinsics,
      metadata: requestBody.metadata
        ? {
            deviceModel:
              requestBody.metadata.deviceModel ||
              requestBody.metadata.device_model,
            iosVersion:
              requestBody.metadata.iosVersion ||
              requestBody.metadata.ios_version,
            appVersion:
              requestBody.metadata.appVersion ||
              requestBody.metadata.app_version,
          }
        : undefined,
    };

    console.log(
      "📥 [LIDAR CAPTURE API] Original body keys:",
      Object.keys(requestBody)
    );
    console.log("📥 [LIDAR CAPTURE API] Normalized body:", {
      side: normalizedBody.side,
      hasMeasurementId: !!normalizedBody.measurementId,
      measurementId: normalizedBody.measurementId,
      hasCameraIntrinsics: !!normalizedBody.cameraIntrinsics,
      cameraIntrinsics: normalizedBody.cameraIntrinsics
        ? Object.keys(normalizedBody.cameraIntrinsics)
        : null,
      hasMetadata: !!normalizedBody.metadata,
      metadata: normalizedBody.metadata
        ? Object.keys(normalizedBody.metadata)
        : null,
      hasDeviceModel: !!normalizedBody.metadata?.deviceModel,
      deviceModel: normalizedBody.metadata?.deviceModel,
      hasReferencePoint: !!normalizedBody.reference_point,
      reference_point: normalizedBody.reference_point,
    });

    // Waliduj dane wejściowe
    const data = lidarCaptureSchema.parse(normalizedBody);

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
    if (data.object.reference_point) {
      console.log(
        "📍 Reference Point (JSON string):",
        data.object.reference_point
      );
      try {
        const parsedRef = JSON.parse(data.object.reference_point);
        console.log("📍 Reference Point (parsed):", parsedRef);
      } catch {
        console.log("📍 Reference Point: invalid JSON");
      }
    }

    // Przygotuj dane dla Python API (konwersja do snake_case)
    const pythonPayload: any = {
      background: {
        depth: data.object.reference_point ? "" : data.background.depth,
        timestamp: data.background.timestamp,
      },
      object: {
        depth: data.object.depth,
        mask: data.object.mask,
        timestamp: data.object.timestamp,
        reference_point: data.object.reference_point || "",
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
    const backendUrl =
      process.env.BACKEND_URL ||
      "https://breva-ai-dvf4dcgrcag9fvff.polandcentral-01.azurewebsites.net";

    console.log("📤 Sending to Python backend:", backendUrl);
    console.log("📤 Python Payload structure:", {
      hasBackground: !!pythonPayload.background,
      hasObject: !!pythonPayload.object,
      objectKeys: pythonPayload.object ? Object.keys(pythonPayload.object) : [],
      hasReferencePoint: !!pythonPayload.object?.reference_point,
      reference_pointValue: pythonPayload.object?.reference_point
        ? "present"
        : "empty",
    });

    const pythonResponse = await fetch(
      `${backendUrl}/enqueue-volume-estimation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pythonPayload),
      }
    );

    console.log("📡 Python Response Status:", pythonResponse.status);
    console.log(
      "📡 Python Response Headers:",
      Object.fromEntries(pythonResponse.headers.entries())
    );

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      console.error(
        "❌ Python Backend Error:",
        pythonResponse.status,
        errorText
      );
      console.error("❌ Python Error Response Body:", errorText);

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
        source: "Python Backend",
        backendUrl: backendUrl,
      });
    }

    const pythonResult = await pythonResponse.json();
    console.log(
      "✅ Python Backend response:",
      JSON.stringify(pythonResult, null, 2)
    );
    console.log(
      "✅ Python Backend response - request_id:",
      pythonResult.request_id
    );
    console.log("✅ Python Backend response - status:", pythonResult.status);
    console.log("✅ Python Backend response - message:", pythonResult.message);

    // Zapisz capture jako PENDING z request_id z Pythona
    const captureRecord = await prisma.lidarCapture?.create({
      data: {
        measurementId: data.measurementId,
        side: data.side.toUpperCase() as "LEFT" | "RIGHT",
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
      // Request wysłany do Pythona
      pythonRequest: pythonPayload,
      // Dodatkowe informacje dla Swift
      processingInfo: {
        estimatedTime: "2-5 minutes", // Szacowany czas przetwarzania
        statusUrl: `/api/lidar-capture/status?measurementId=${data.measurementId}&side=${data.side}`,
      },
    };

    return res.status(200).json(response);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("❌ Validation error:", error.issues);
      const errorMessages = error.issues
        .map((e: any) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return res.status(400).json({
        success: false,
        error: `Next.js Validation Error: ${errorMessages}`,
        validationErrors: error.issues,
        errorType: "VALIDATION_ERROR",
        timestamp: new Date().toISOString(),
        // Informacje dla Swift - błąd powinien być wyświetlany dłużej
        displayDuration: 5000, // 5 sekund
      });
    }

    console.error("❌ Error processing LiDAR data:", error);

    return res.status(500).json({
      success: false,
      message: `Next.js Server Error: ${
        error?.message || "Failed to process LiDAR data"
      }`,
      error: error?.message || "Internal server error",
      errorType: "SERVER_ERROR",
      side: "",
      measurementId: "",
      timestamp: new Date().toISOString(),
      // Informacje dla Swift - błąd powinien być wyświetlany dłużej
      displayDuration: 5000, // 5 sekund
    });
  }
}

// Funkcja do polling statusu z Python API
async function pollVolumeEstimation(
  requestId: number,
  measurementId: string,
  side: string
) {
  const pythonApiUrl =
    process.env.BACKEND_URL ||
    "https://breva-ai-dvf4dcgrcag9fvff.polandcentral-01.azurewebsites.net";
  const maxAttempts = 60; // 5 minut z interwałem 5 sekund
  let attempts = 0;

  console.log(
    `🔄 [POLLING] Start polling dla requestId=${requestId}, pythonApiUrl=${pythonApiUrl}`
  );

  const pollInterval = setInterval(async () => {
    try {
      attempts++;

      const statusUrl = `${pythonApiUrl}/volume-estimation/${requestId}`;
      console.log(
        `🔍 [POLLING] Attempt ${attempts}/${maxAttempts}: Checking ${statusUrl}`
      );

      const statusResponse = await fetch(statusUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!statusResponse.ok) {
        console.error(
          `❌ [POLLING] Failed to fetch status for request ${requestId}: ${statusResponse.status} ${statusResponse.statusText}`
        );
        if (attempts >= maxAttempts) {
          console.error(
            `❌ [POLLING] Max attempts reached for requestId=${requestId}, marking as FAILED`
          );
          clearInterval(pollInterval);
          await updateCaptureStatus(requestId, "FAILED");
        }
        return;
      }

      const statusData: any = await statusResponse.json(); // Use any for snake_case compatibility
      console.log(
        `✅ [POLLING] Status response for requestId=${requestId} (attempt ${attempts}/${maxAttempts}):`,
        {
          status: statusData.status,
          estimated_volume: statusData.estimated_volume,
        }
      );

      // Konwersja snake_case → uppercase dla Prisma enum
      const normalizedStatus = statusData.status?.toUpperCase() || "PENDING";
      // Python API zwraca objętość w mm³, konwertujemy na ml (dzielenie przez 1000)
      const estimatedVolumeRaw =
        statusData.estimated_volume || statusData.estimatedVolume;
      const estimatedVolume = estimatedVolumeRaw
        ? estimatedVolumeRaw / 1000
        : undefined;

      // Aktualizuj status w bazie danych (estimatedVolume już w ml)
      await updateCaptureStatus(requestId, normalizedStatus, estimatedVolume);

      if (normalizedStatus === "COMPLETED" && estimatedVolume) {
        // Zapisz wynik do analizy piersi (estimatedVolume już w ml)
        await saveVolumeResult(measurementId, side, estimatedVolume);
        clearInterval(pollInterval);
        console.log(
          `✅ [POLLING] Volume estimation completed for ${side} breast: ${estimatedVolume}ml`
        );
      } else if (normalizedStatus === "FAILED" || attempts >= maxAttempts) {
        clearInterval(pollInterval);
        console.log(
          `❌ [POLLING] Volume estimation failed for request ${requestId}, status=${normalizedStatus}`
        );
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
