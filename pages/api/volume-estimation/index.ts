import type { NextApiRequest, NextApiResponse } from "next";
import {
  VolumeEstimationRequest,
  VolumeEstimationResponse,
} from "@/types/volume-estimation";
import { validateVolumeEstimationRequest } from "@/utils/validation";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VolumeEstimationResponse | { error: string }>,
) {
  // Obsługa CORS preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    return res.status(200).end();
  }

  // Logowanie dla diagnostyki
  console.log("📥 [VOLUME ESTIMATION API] Received request:");
  console.log("📥 [VOLUME ESTIMATION API] Method:", req.method);
  console.log("📥 [VOLUME ESTIMATION API] URL:", req.url);
  console.log("📥 [VOLUME ESTIMATION API] Headers:", {
    "content-type": req.headers["content-type"],
    "user-agent": req.headers["user-agent"],
    origin: req.headers["origin"],
  });

  if (req.method !== "POST") {
    console.error("❌ [VOLUME ESTIMATION API] Method not allowed:", req.method);
    return res.status(405).json({
      error: "Method not allowed",
      allowedMethods: ["POST", "OPTIONS"],
      receivedMethod: req.method,
    });
  }

  try {
    // Walidacja danych
    const data: VolumeEstimationRequest = req.body;

    console.log("📊 Volume Estimation Request received");
    console.log("📊 Data structure:", {
      hasBackground: !!data.background,
      hasObject: !!data.object,
      hasCameraIntrinsics: !!data.camera_intrinsics,
      hasMetadata: !!data.metadata,
    });

    // Sprawdź wymagane pola
    if (!validateVolumeEstimationRequest(data)) {
      console.error("❌ Next.js Validation Error: Invalid request data format");
      return res.status(400).json({
        error:
          "Next.js Validation Error: Invalid request data format. Check FRONTEND_RECOMMENDATIONS.md for required structure.",
        source: "Next.js",
      });
    }

    // Dodatkowa walidacja mask
    try {
      const maskPoints = JSON.parse(data.object.mask);
      if (!Array.isArray(maskPoints) || maskPoints.length === 0) {
        return res.status(400).json({
          error:
            "Next.js Validation Error: Invalid mask format - must be non-empty array",
          source: "Next.js",
        });
      }
    } catch (maskError) {
      return res.status(400).json({
        error: "Next.js Validation Error: Invalid mask JSON format",
        source: "Next.js",
      });
    }

    // Wyślij do backendu Python
    const backendUrl =
      process.env.BACKEND_URL || "https://breavabackend.reliefy.doctor";

    console.log("📤 Sending request to Python backend:", backendUrl);
    console.log("📤 Request data summary:", {
      background: {
        depthLength: data.background.depth.length,
        timestamp: data.background.timestamp,
      },
      object: {
        depthLength: data.object.depth.length,
        maskLength: data.object.mask.length,
        timestamp: data.object.timestamp,
      },
      cameraIntrinsics: data.camera_intrinsics,
      metadata: data.metadata,
    });

    const response = await fetch(`${backendUrl}/enqueue-volume-estimation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("📡 Python Response Status:", response.status);
    console.log(
      "📡 Python Response Headers:",
      Object.fromEntries(response.headers.entries()),
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Python Backend Error:", response.status, errorText);
      console.error("❌ Python Error Response Body:", errorText);

      let pythonError;
      try {
        pythonError = JSON.parse(errorText);
      } catch {
        pythonError = errorText;
      }

      return res.status(response.status).json({
        error: `Python Backend Error (${response.status}): ${response.statusText}`,
        details: pythonError,
        source: "Python Backend",
        backendUrl: backendUrl,
      });
    }

    const result: VolumeEstimationResponse = await response.json();
    console.log("✅ Python Backend response:", JSON.stringify(result, null, 2));
    console.log("✅ Python Backend response - request_id:", result.request_id);
    console.log("✅ Python Backend response - status:", result.status);
    console.log("✅ Python Backend response - message:", result.message);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ Next.js Server Error:", error);
    return res.status(500).json({
      error: `Next.js Server Error: ${error?.message || "Internal server error"}`,
      source: "Next.js",
      stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
    });
  }
}
