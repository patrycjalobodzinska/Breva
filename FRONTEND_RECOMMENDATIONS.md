# Zalecenia dotyczące struktury danych dla Swift i Next.js

## 📱 Swift → Next.js → Backend Python

### Struktura danych wymagana przez backend

Backend Python oczekuje następującej struktury JSON:

```typescript
interface VolumeEstimationRequest {
  background: {
    depth: string; // Base64 encoded depth map (uint16 array)
    timestamp: string; // ISO 8601 timestamp
  };
  object: {
    depth: string; // Base64 encoded depth map (uint16 array)
    mask: string; // JSON string z tablicą punktów [{"x": number, "y": number}, ...]
    timestamp: string; // ISO 8601 timestamp
  };
  camera_intrinsics: {
    fx: number; // Horizontal focal length
    fy: number; // Vertical focal length
    cx: number; // Principal point x
    cy: number; // Principal point y
    width: number; // Image width in pixels
    height: number; // Image height in pixels
  };
  metadata: {
    device_model: string; // Np. "Intel RealSense D435i"
  };
}
```

---

## 🍎 Zalecenia dla Swift (iOS)

### 1. Struktura danych do wysyłki do Next.js

Zdefiniuj strukturę danych w Swift:

```swift
import Foundation

// MARK: - Request Structures
struct VolumeEstimationRequest: Codable {
    let background: ImageData
    let object: ObjectData
    let cameraIntrinsics: CameraIntrinsics
    let metadata: Metadata

    enum CodingKeys: String, CodingKey {
        case background
        case object
        case cameraIntrinsics = "camera_intrinsics"
        case metadata
    }
}

struct ImageData: Codable {
    let depth: String      // Base64 encoded depth map
    let timestamp: String  // ISO 8601 format
}

struct ObjectData: Codable {
    let depth: String      // Base64 encoded depth map
    let mask: String       // JSON string with points array
    let timestamp: String
}

struct CameraIntrinsics: Codable {
    let fx: Double
    let fy: Double
    let cx: Double
    let cy: Double
    let width: Int
    let height: Int
}

struct Metadata: Codable {
    let deviceModel: String

    enum CodingKeys: String, CodingKey {
        case deviceModel = "device_model"
    }
}
```

### 2. Przygotowanie danych depth map

```swift
import UIKit
import AVFoundation

extension UIImage {
    /// Konwertuje depth map do base64 string
    func encodeDepthToBase64() -> String? {
        guard let ciImage = CIImage(image: self),
              let depthData = ciImage.properties[kCGImagePropertyDepthData as String] as? [String: Any],
              let depthMap = depthData["DepthMap"] as? Data else {
            return nil
        }
        return depthMap.base64EncodedString()
    }
}

// Alternatywnie, jeśli używasz AVDepthData:
func encodeAVDepthToBase64(depthData: AVDepthData) -> String? {
    let depthMap = depthData.depthDataMap
    let width = CVPixelBufferGetWidth(depthMap)
    let height = CVPixelBufferGetHeight(depthMap)

    CVPixelBufferLockBaseAddress(depthMap, .readOnly)
    defer { CVPixelBufferUnlockBaseAddress(depthMap, .readOnly) }

    guard let baseAddress = CVPixelBufferGetBaseAddress(depthMap) else {
        return nil
    }

    let bytesPerRow = CVPixelBufferGetBytesPerRow(depthMap)
    let data = Data(bytes: baseAddress, count: bytesPerRow * height)

    return data.base64EncodedString()
}
```

### 3. Przygotowanie maski jako JSON string

```swift
struct MaskPoint: Codable {
    let x: Double
    let y: Double
}

func createMaskJSONString(points: [CGPoint]) -> String? {
    let maskPoints = points.map { point in
        MaskPoint(x: Double(point.x), y: Double(point.y))
    }

    guard let jsonData = try? JSONEncoder().encode(maskPoints),
          let jsonString = String(data: jsonData, encoding: .utf8) else {
        return nil
    }

    return jsonString
}
```

### 4. Wysyłanie danych do Next.js API

```swift
import Foundation

class VolumeEstimationService {
    let nextJSBaseURL: String = "https://your-nextjs-app.com/api" // Zmień na swój URL

    func sendVolumeEstimation(
        backgroundDepth: String,
        backgroundTimestamp: Date,
        objectDepth: String,
        objectMask: [CGPoint],
        objectTimestamp: Date,
        cameraIntrinsics: CameraIntrinsics,
        deviceModel: String,
        completion: @escaping (Result<VolumeEstimationResponse, Error>) -> Void
    ) {
        // Przygotuj maskę jako JSON string
        guard let maskJSON = createMaskJSONString(points: objectMask) else {
            completion(.failure(NSError(domain: "MaskEncodingError", code: -1)))
            return
        }

        // Przygotuj request
        let request = VolumeEstimationRequest(
            background: ImageData(
                depth: backgroundDepth,
                timestamp: ISO8601DateFormatter().string(from: backgroundTimestamp)
            ),
            object: ObjectData(
                depth: objectDepth,
                mask: maskJSON,
                timestamp: ISO8601DateFormatter().string(from: objectTimestamp)
            ),
            cameraIntrinsics: cameraIntrinsics,
            metadata: Metadata(deviceModel: deviceModel)
        )

        // Konwertuj do JSON
        guard let jsonData = try? JSONEncoder().encode(request),
              let jsonString = String(data: jsonData, encoding: .utf8),
              let url = URL(string: "\(nextJSBaseURL)/volume-estimation") else {
            completion(.failure(NSError(domain: "RequestEncodingError", code: -1)))
            return
        }

        // Przygotuj HTTP request
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.httpBody = jsonData

        // Wyślij request
        URLSession.shared.dataTask(with: urlRequest) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }

            guard let data = data else {
                completion(.failure(NSError(domain: "NoDataError", code: -1)))
                return
            }

            do {
                let response = try JSONDecoder().decode(VolumeEstimationResponse.self, from: data)
                completion(.success(response))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
}
```

### 5. Przykład użycia w Swift

```swift
let service = VolumeEstimationService()

let cameraIntrinsics = CameraIntrinsics(
    fx: 607.18,
    fy: 606.77,
    cx: 329.46,
    cy: 242.86,
    width: 640,
    height: 480
)

let maskPoints: [CGPoint] = [
    CGPoint(x: 188.0, y: 75.0),
    CGPoint(x: 224.0, y: 58.0),
    // ... więcej punktów
]

service.sendVolumeEstimation(
    backgroundDepth: backgroundDepthBase64,
    backgroundTimestamp: Date(),
    objectDepth: objectDepthBase64,
    objectMask: maskPoints,
    objectTimestamp: Date(),
    cameraIntrinsics: cameraIntrinsics,
    deviceModel: "Intel RealSense D435i"
) { result in
    switch result {
    case .success(let response):
        print("Success! Request ID: \(response.requestId)")
    case .failure(let error):
        print("Error: \(error.localizedDescription)")
    }
}
```

---

## ⚛️ Zalecenia dla Next.js

### 1. API Route do przyjęcia danych z Swift

Utwórz plik `pages/api/volume-estimation/index.ts` (lub `app/api/volume-estimation/route.ts` dla App Router):

```typescript
import type { NextApiRequest, NextApiResponse } from "next";

interface VolumeEstimationRequest {
  background: {
    depth: string;
    timestamp: string;
  };
  object: {
    depth: string;
    mask: string; // JSON string
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

interface VolumeEstimationResponse {
  message: string;
  request_id: number;
  status: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VolumeEstimationResponse | { error: string }>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Walidacja danych
    const data: VolumeEstimationRequest = req.body;

    // Sprawdź wymagane pola
    if (!data.background?.depth || !data.background?.timestamp) {
      return res.status(400).json({ error: "Missing background data" });
    }

    if (!data.object?.depth || !data.object?.mask || !data.object?.timestamp) {
      return res.status(400).json({ error: "Missing object data" });
    }

    if (!data.camera_intrinsics || !data.metadata) {
      return res
        .status(400)
        .json({ error: "Missing camera intrinsics or metadata" });
    }

    // Walidacja mask - sprawdź czy to poprawny JSON
    try {
      const maskPoints = JSON.parse(data.object.mask);
      if (!Array.isArray(maskPoints) || maskPoints.length === 0) {
        return res.status(400).json({ error: "Invalid mask format" });
      }
    } catch {
      return res.status(400).json({ error: "Invalid mask JSON format" });
    }

    // Wyślij do backendu Python
    const backendUrl =
      process.env.BACKEND_URL || "https://your-backend-url.com";
    const response = await fetch(`${backendUrl}/enqueue-volume-estimation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      return res.status(response.status).json({
        error: `Backend error: ${response.statusText}`,
      });
    }

    const result: VolumeEstimationResponse = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
```

### 2. App Router (Next.js 13+)

Jeśli używasz App Router, utwórz `app/api/volume-estimation/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Walidacja danych (tak jak powyżej)
    if (!data.background?.depth || !data.background?.timestamp) {
      return NextResponse.json(
        { error: "Missing background data" },
        { status: 400 },
      );
    }

    if (!data.object?.depth || !data.object?.mask || !data.object?.timestamp) {
      return NextResponse.json(
        { error: "Missing object data" },
        { status: 400 },
      );
    }

    // Walidacja mask
    try {
      const maskPoints = JSON.parse(data.object.mask);
      if (!Array.isArray(maskPoints) || maskPoints.length === 0) {
        return NextResponse.json(
          { error: "Invalid mask format" },
          { status: 400 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid mask JSON format" },
        { status: 400 },
      );
    }

    // Wyślij do backendu Python
    const backendUrl =
      process.env.BACKEND_URL || "https://your-backend-url.com";
    const response = await fetch(`${backendUrl}/enqueue-volume-estimation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}` },
        { status: response.status },
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### 3. TypeScript types dla Next.js

Utwórz plik `types/volume-estimation.ts`:

```typescript
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
```

### 4. Funkcja pomocnicza do walidacji

Utwórz `utils/validation.ts`:

```typescript
import { VolumeEstimationRequest, MaskPoint } from "@/types/volume-estimation";

export function validateVolumeEstimationRequest(
  data: any,
): data is VolumeEstimationRequest {
  // Sprawdź strukturę
  if (!data || typeof data !== "object") {
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
  if (
    !ci ||
    typeof ci.fx !== "number" ||
    typeof ci.fy !== "number" ||
    typeof ci.cx !== "number" ||
    typeof ci.cy !== "number" ||
    typeof ci.width !== "number" ||
    typeof ci.height !== "number"
  ) {
    return false;
  }

  // Metadata
  if (
    !data.metadata?.device_model ||
    typeof data.metadata.device_model !== "string"
  ) {
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
      if (typeof point.x !== "number" || typeof point.y !== "number") {
        return false;
      }
    }
  } catch {
    return false;
  }

  return true;
}
```

### 5. Konfiguracja środowiska

Dodaj do `.env.local`:

```env
BACKEND_URL=https://breavabackend.reliefy.doctor
```

### 6. Przykład użycia z frontendu Next.js

```typescript
// components/VolumeEstimationForm.tsx
"use client";

import { useState } from "react";

export default function VolumeEstimationForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (data: VolumeEstimationRequest) => {
    setLoading(true);
    try {
      const response = await fetch("/api/volume-estimation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to send request");
      }

      const result = await response.json();
      setResult(result);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ... reszta komponentu
}
```

---

## 🔑 Kluczowe punkty do zapamiętania

### ✅ Co jest WYMAGANE:

1. **Background**: `depth` (base64), `timestamp` (ISO 8601)
2. **Object**: `depth` (base64), `mask` (JSON string), `timestamp` (ISO 8601)
3. **Camera Intrinsics**: wszystkie 6 wartości numeryczne
4. **Metadata**: `device_model` jako string

### ❌ Co NIE jest już używane:

- **Pole `rgb`** - zostało usunięte z API
- **Mask jako base64** - mask musi być JSON string z tablicą punktów

### 📝 Format mask:

```json
"[{\"x\": 188.0, \"y\": 75.0}, {\"x\": 224.0, \"y\": 58.0}, ...]"
```

### ⚠️ Ważne uwagi:

1. **Timestamp**: Używaj formatu ISO 8601: `"2025-10-29T21:04:01.974618"`
2. **Depth maps**: Muszą być zakodowane jako base64 z raw uint16 array
3. **Mask points**: Współrzędne muszą być liczbami (nie stringami)
4. **CORS**: Upewnij się, że backend Python ma skonfigurowane CORS dla domeny Next.js

---

## 🧪 Testowanie

### Test z Swift:

```swift
// Sprawdź czy dane są poprawnie zakodowane
print("Background depth length: \(backgroundDepth.count)")
print("Object depth length: \(objectDepth.count)")
print("Mask JSON: \(maskJSON)")
```

### Test z Next.js:

```typescript
// W API route, przed wysłaniem do backendu:
console.log("Received data:", {
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
```
