# 📱 Struktura danych API dla aplikacji Swift

## ⚠️ WAŻNE ZMIANY
**RGB zostało USUNIĘTE** z API! Nie wysyłaj już pól `rgb` w żadnym endpoincie.

---

## 🔌 Endpoint 1: `/api/lidar-capture` (z autoryzacją)

### URL
```
POST https://breva.vercel.app/api/lidar-capture
```

### Headers
```
Content-Type: application/json
Cookie: next-auth.session-token=<token>  // Wymagana autoryzacja
```

### Request Body (JSON)
```json
{
  "side": "left",  // lub "right"
  "measurementId": "clxxx...",
  "background": {
    "depth": "AQIDBA...",  // Base64 encoded depth map (uint16 array)
    "timestamp": "2025-11-01T14:30:00.000Z"  // ISO 8601 format
  },
  "object": {
    "depth": "AQIDBA...",  // Base64 encoded depth map (uint16 array)
    "mask": "[{\"x\":188.0,\"y\":75.0},{\"x\":224.0,\"y\":58.0}]",  // JSON string (escape quotes!)
    "timestamp": "2025-11-01T14:30:01.000Z"  // ISO 8601 format
  },
  "cameraIntrinsics": {
    "fx": 607.18,
    "fy": 606.77,
    "cx": 329.46,
    "cy": 242.86,
    "width": 640,
    "height": 480
  },
  "metadata": {
    "deviceModel": "iPhone 15 Pro",
    "iosVersion": "17.0",      // Opcjonalne
    "appVersion": "1.0.0"      // Opcjonalne
  }
}
```

### Response (Success 200)
```json
{
  "success": true,
  "message": "LiDAR data sent to Python backend for processing",
  "captureId": "clxxx...",
  "requestId": 123456,
  "side": "left",
  "measurementId": "clxxx...",
  "status": "pending",
  "timestamp": "2025-11-01T14:30:02.000Z"
}
```

**UWAGA:** Endpoint teraz wysyła dane do Python backendu i zwraca status `"pending"`. Volume będzie dostępne po zakończeniu przetwarzania (sprawdź przez `/api/lidar-capture/status` lub sprawdź pomiar w bazie danych).

### Response (Error 400 - Validation)
```json
{
  "error": "Next.js Validation Error: background.depth: Required",
  "validationErrors": [
    {
      "path": ["background", "depth"],
      "message": "Required"
    }
  ]
}
```

### Response (Error 401 - Unauthorized)
```json
{
  "error": "Unauthorized"
}
```

### Response (Error 500 - Python Backend Error)
```json
{
  "success": false,
  "error": "Python Backend Error (500): Internal Server Error",
  "details": "Error details from Python...",
  "source": "Python Backend",
  "backendUrl": "https://breva-ai-dvf4dcgrcag9fvff.polandcentral-01.azurewebsites.net"
}
```

---

## 🔌 Endpoint 2: `/api/volume-estimation` (BEZ autoryzacji, bezpośrednio do Python)

### URL
```
POST https://breva.vercel.app/api/volume-estimation
```

### Headers
```
Content-Type: application/json
```

### Request Body (JSON)
```json
{
  "background": {
    "depth": "AQIDBA...",  // Base64 encoded depth map (uint16 array)
    "timestamp": "2025-11-01T14:30:00.000Z"  // ISO 8601 format
  },
  "object": {
    "depth": "AQIDBA...",  // Base64 encoded depth map (uint16 array)
    "mask": "[{\"x\":188.0,\"y\":75.0},{\"x\":224.0,\"y\":58.0}]",  // JSON string (escape quotes!)
    "timestamp": "2025-11-01T14:30:01.000Z"  // ISO 8601 format
  },
  "camera_intrinsics": {  // UWAGA: snake_case (ze względu na Python backend)
    "fx": 607.18,
    "fy": 606.77,
    "cx": 329.46,
    "cy": 242.86,
    "width": 640,
    "height": 480
  },
  "metadata": {
    "device_model": "iPhone 15 Pro"  // UWAGA: snake_case
  }
}
```

### Response (Success 200)
```json
{
  "message": "Volume estimation request queued successfully",
  "request_id": 789012,
  "status": "pending"
}
```

### Response (Error 400 - Next.js Validation)
```json
{
  "error": "Next.js Validation Error: Invalid request data format. Check FRONTEND_RECOMMENDATIONS.md for required structure.",
  "source": "Next.js"
}
```

### Response (Error 500 - Python Backend Error)
```json
{
  "error": "Python Backend Error (500): Internal Server Error",
  "details": "Error details from Python backend...",
  "source": "Python Backend",
  "backendUrl": "https://breva-ai-dvf4dcgrcag9fvff.polandcentral-01.azurewebsites.net"
}
```

---

## 📋 Kluczowe różnice między endpointami

| Właściwość | `/api/lidar-capture` | `/api/volume-estimation` |
|-----------|---------------------|-------------------------|
| **Autoryzacja** | ✅ Wymagana (session token) | ❌ Nie wymagana |
| **Naming convention** | camelCase | snake_case |
| **Side field** | ✅ Wymagane | ❌ Brak |
| **MeasurementId** | ✅ Wymagane | ❌ Brak |
| **Zapis do DB** | ✅ Tak (LidarCapture + polling) | ❌ Nie (tylko proxy do Python) |
| **Polling** | ✅ Auto-polling dla wyniku | ❌ Nie ma pollingu |
| **Backend Python** | ✅ Wysyła do `/enqueue-volume-estimation` | ✅ Wysyła do `/enqueue-volume-estimation` |

---

## 🔑 Wymagane pola

### Dla obu endpointów:

✅ **background.depth** - String (Base64)
✅ **background.timestamp** - String (ISO 8601)
✅ **object.depth** - String (Base64)
✅ **object.mask** - String (JSON array jako string)
✅ **object.timestamp** - String (ISO 8601)
✅ **cameraIntrinsics** / **camera_intrinsics** - Object z 6 wartościami numerycznymi
✅ **metadata.deviceModel** / **metadata.device_model** - String

❌ **RGB** - USUNIĘTE! Nie wysyłaj tego pola!

---

## 📝 Format danych

### Depth Map (Base64)
```swift
// Swift - konwersja depth map do Base64
let depthData = depthMap.dataRepresentation() // raw uint16 array
let base64String = depthData.base64EncodedString()
```

### Mask (JSON String)
```swift
// Swift - konwersja punktów do JSON string
let points = [CGPoint(x: 188, y: 75), CGPoint(x: 224, y: 58)]
let maskData = try JSONEncoder().encode(points.map { ["x": $0.x, "y": $0.y] })
let maskString = String(data: maskData, encoding: .utf8)! // "[{\"x\":188.0,\"y\":75.0},...]"
```

### Timestamp (ISO 8601)
```swift
// Swift - format ISO 8601
let timestamp = ISO8601DateFormatter().string(from: Date())
// "2025-11-01T14:30:00.000Z"
```

---

## 🚀 Python Backend

### URL backendu
```
https://breva-ai-dvf4dcgrcag9fvff.polandcentral-01.azurewebsites.net
```

### Endpoint
```
POST /enqueue-volume-estimation
```

Next.js automatycznie przekazuje wszystkie dane do tego endpointu.

---

## 🔍 Rozpoznawanie błędów

Wszystkie błędy zawierają pole `source`:

- **`"source": "Next.js"`** - błąd walidacji lub serwera Next.js
- **`"source": "Python Backend"`** - błąd z backendu Python (Azure)

### Przykłady:

**Next.js Validation Error:**
```json
{
  "error": "Next.js Validation Error: background.depth: Required",
  "source": "Next.js"
}
```

**Python Backend Error:**
```json
{
  "error": "Python Backend Error (422): Unprocessable Entity",
  "details": { "detail": "Invalid depth map format" },
  "source": "Python Backend",
  "backendUrl": "https://breva-ai-dvf4dcgrcag9fvff.polandcentral-01.azurewebsites.net"
}
```

---

## ✅ Checklist przed wysłaniem

- [ ] Usunięto wszystkie pola `rgb`
- [ ] `depth` jest Base64 string (nie obiekt)
- [ ] `mask` jest JSON string (nie tablica)
- [ ] `timestamp` jest w formacie ISO 8601
- [ ] Wszystkie 6 wartości `cameraIntrinsics` są liczbami
- [ ] Dla `/api/lidar-capture`: sprawdź czy masz session token
- [ ] Sprawdź naming convention (camelCase vs snake_case)

---

## 🐛 Debugging

### Sprawdź logi Next.js:
1. Otwórz terminal gdzie działa `pnpm dev`
2. Szukaj emoji: 📱 (lidar-capture) lub 📊 (volume-estimation)
3. Sprawdź czy dane są wysyłane do `https://breva-ai-dvf4dcgrcag9fvff.polandcentral-01.azurewebsites.net`

### Sprawdź response error:
- `source: "Next.js"` - problem z danymi przed wysłaniem do Pythona
- `source: "Python Backend"` - problem na backendzie Python
- Zobacz `details` lub `validationErrors` dla szczegółów
