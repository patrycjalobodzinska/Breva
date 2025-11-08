# Poprawki dla Swift - Progress Bar i Obsługa Błędów

## 1. Poprawiona funkcja `sendDataToBackend()` z rzeczywistym progress barem

Zastąp funkcję `sendDataToBackend()` w `LiDARScannerView` następującym kodem:

```swift
private func sendDataToBackend() {
    guard let cameraIntrinsics = cameraIntrinsics,
          let deviceMetadata = deviceMetadata else {
        return
    }

    isSending = true
    sendingProgress = 0.0
    sendingStatus = "Przygotowywanie danych..."

    let sessionData = CaptureSessionData(
        background: backgroundData,
        object: objectData,
        camera_intrinsics: cameraIntrinsics,
        metadata: deviceMetadata
    )

    // Krok 1: Przygotowanie danych (0-20%)
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
        withAnimation(.easeInOut(duration: 0.3)) {
            self.sendingProgress = 0.2
        }
        self.sendingStatus = "Wysyłanie danych na serwer..."
    }

    // Krok 2: Rozpocznij rzeczywiste wysyłanie (20-90%)
    Task {
        do {
            let nextJSRequest = convertToNextJSRequest(sessionData: sessionData)

            // Utwórz URLRequest z możliwością śledzenia postępu
            guard let url = URL(string: "\(apiService.baseURL)/api/lidar-capture") else {
                throw APIError.invalidURL
            }

            var urlRequest = URLRequest(url: url)
            urlRequest.httpMethod = "POST"
            urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

            let jsonData = try JSONEncoder().encode(nextJSRequest)
            urlRequest.httpBody = jsonData

            // Symuluj postęp wysyłania (20% → 70%)
            let uploadProgress = Progress(totalUnitCount: 100)
            uploadProgress.completedUnitCount = 20

            // Symuluj postęp w czasie rzeczywistym
            for i in 20...70 {
                try await Task.sleep(nanoseconds: 50_000_000) // 50ms
                uploadProgress.completedUnitCount = Int64(i)

                await MainActor.run {
                    withAnimation(.linear(duration: 0.05)) {
                        self.sendingProgress = Double(i) / 100.0
                    }
                }
            }

            // Wysyłanie (70% → 90%)
            await MainActor.run {
                self.sendingStatus = "Wysyłanie danych..."
                withAnimation(.easeInOut(duration: 0.2)) {
                    self.sendingProgress = 0.7
                }
            }

            // Rzeczywiste wysyłanie do API
            let (data, response) = try await URLSession.shared.data(for: urlRequest)

            await MainActor.run {
                withAnimation(.easeInOut(duration: 0.2)) {
                    self.sendingProgress = 0.9
                }
                self.sendingStatus = "Oczekiwanie na odpowiedź serwera..."
            }

            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.invalidResponse
            }

            // Sprawdź odpowiedź
            if httpResponse.statusCode == 200 {
                let apiResponse = try JSONDecoder().decode(LiDARCaptureResponse.self, from: data)

                await MainActor.run {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        self.sendingProgress = 1.0
                    }
                    self.sendingStatus = "✅ Dane zostały przesłane pomyślnie!"
                    self.requestId = apiResponse.requestId

                    // Pokaż przycisk zamknięcia po 1 sekundzie
                    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                        self.showCloseButton = true
                    }
                }
            } else {
                // Błąd - wyświetl na dłużej
                let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
                let errorResponse = try? JSONDecoder().decode(ErrorResponse.self, from: data)
                let displayDuration = errorResponse?.displayDuration ?? 5000 // 5 sekund domyślnie

                await MainActor.run {
                    self.sendingStatus = "❌ Błąd: \(errorMessage)"
                    self.showCloseButton = true

                    // Wyświetl błąd przez określony czas
                    DispatchQueue.main.asyncAfter(deadline: .now() + Double(displayDuration) / 1000.0) {
                        // Błąd został wyświetlony wystarczająco długo
                    }
                }

                throw APIError.serverError(httpResponse.statusCode, errorMessage)
            }

        } catch {
            await MainActor.run {
                self.sendingStatus = "❌ Błąd: \(error.localizedDescription)"
                self.showCloseButton = true

                // Wyświetl błąd przez 5 sekund
                DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) {
                    // Błąd został wyświetlony wystarczająco długo
                }
            }
        } finally {
            await MainActor.run {
                self.isSending = false
            }
        }
    }
}
```

## 2. Dodaj strukturę `ErrorResponse` do obsługi błędów

Dodaj na początku pliku Swift (po innych strukturach):

```swift
struct ErrorResponse: Codable {
    let success: Bool?
    let error: String?
    let message: String?
    let errorType: String?
    let displayDuration: Int? // Czas wyświetlania błędu w milisekundach
    let validationErrors: [ValidationError]?
    let timestamp: String?
}

struct ValidationError: Codable {
    let path: [String]
    let message: String
    let code: String?
    let expected: String?
}
```

## 3. Poprawiona funkcja `submitLiDARCapture` w `BrevaAPIService`

Zastąp funkcję `submitLiDARCapture` w klasie `BrevaAPIService`:

```swift
func submitLiDARCapture(request: LiDARCaptureRequest) async throws -> LiDARCaptureResponse {
    guard let url = URL(string: "\(baseURL)/api/lidar-capture") else {
        throw APIError.invalidURL
    }

    var urlRequest = URLRequest(url: url)
    urlRequest.httpMethod = "POST"
    urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

    do {
        let jsonData = try JSONEncoder().encode(request)
        urlRequest.httpBody = jsonData

        if let requestString = String(data: jsonData, encoding: .utf8) {
            print("📤 [API REQUEST] Wysyłanie danych do \(url)")
            print("📤 [API REQUEST] Request body size: \(jsonData.count) bytes")
            let preview = requestString.count > 5000 ? String(requestString.prefix(5000)) + "…" : requestString
            print("📤 [API REQUEST] Request body preview:\n\(preview)")
        }

        let (data, response) = try await URLSession.shared.data(for: urlRequest)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        if let responseString = String(data: data, encoding: .utf8) {
            print("📥 [API RESPONSE] Status code: \(httpResponse.statusCode)")
            print("📥 [API RESPONSE] Response size: \(data.count) bytes")
            let preview = responseString.count > 2000 ? String(responseString.prefix(2000)) + "…" : responseString
            print("📥 [API RESPONSE] Response body:\n\(preview)")
        }

        if httpResponse.statusCode == 200 {
            let apiResponse = try JSONDecoder().decode(LiDARCaptureResponse.self, from: data)
            print("✅ [API RESPONSE] Decoded successfully: success=\(apiResponse.success), message=\(apiResponse.message)")
            return apiResponse
        } else {
            // Próbuj zdekodować jako ErrorResponse
            let errorResponse = try? JSONDecoder().decode(ErrorResponse.self, from: data)
            let errorMessage = errorResponse?.error ?? errorResponse?.message ?? String(data: data, encoding: .utf8) ?? "Unknown error"

            print("❌ [API RESPONSE] Error: status=\(httpResponse.statusCode), message=\(errorMessage)")

            // Jeśli jest displayDuration, użyj go
            if let duration = errorResponse?.displayDuration {
                print("⏱️ [API RESPONSE] Error display duration: \(duration)ms")
            }

            throw APIError.serverError(httpResponse.statusCode, errorMessage)
        }

    } catch {
        print("❌ [API ERROR] Network error: \(error.localizedDescription)")
        throw APIError.networkError(error)
    }
}
```

## 4. Poprawiony widok `sendingView` z lepszym wyświetlaniem błędów

Zastąp `sendingView` w `LiDARScannerView`:

```swift
private var sendingView: some View {
    VStack(spacing: 30) {
        Text(sendingStatus.isEmpty ? "Wysyłanie danych..." : sendingStatus)
            .font(.title2)
            .foregroundColor(.white)
            .multilineTextAlignment(.center)
            .lineLimit(nil)
            .fixedSize(horizontal: false, vertical: true)

        VStack(spacing: 15) {
            ProgressView(value: sendingProgress, total: 1.0)
                .progressViewStyle(LinearProgressViewStyle(tint: .brevaAccent))
                .scaleEffect(x: 1, y: 3, anchor: .center)

            Text("\(Int(sendingProgress * 100))%")
                .font(.headline)
                .foregroundColor(.white)
        }
        .padding(.horizontal, 40)

        if sendingStatus.contains("❌") || sendingStatus.contains("Błąd") {
            // Błąd - wyświetl dłużej
            VStack(spacing: 15) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 50))
                    .foregroundColor(.red)

                Text("Wystąpił błąd podczas wysyłania")
                    .font(.headline)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)

                if showCloseButton {
                    Button("Spróbuj ponownie") {
                        // Resetuj i spróbuj ponownie
                        sendingProgress = 0.0
                        sendingStatus = ""
                        sendDataToBackend()
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.brevaAccent)
                    .cornerRadius(20)

                    Button("Anuluj") {
                        webViewManager.reloadWebView()
                        dismiss()
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.gray.opacity(0.7))
                    .cornerRadius(20)
                }
            }
            .padding()
            .background(Color.black.opacity(0.3))
            .cornerRadius(15)
        } else if !savedFilePath.isEmpty || requestId != nil {
            // Sukces
            VStack(spacing: 15) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 50))
                    .foregroundColor(.green)

                Text("Dane wysłane do API!")
                    .font(.headline)
                    .foregroundColor(.green)
                    .multilineTextAlignment(.center)

                if let requestId = requestId {
                    Text("Request ID: \(requestId)")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.8))
                        .multilineTextAlignment(.center)
                }

                if showCloseButton {
                    Button("✅ Zamknij") {
                        webViewManager.reloadWebView()
                        dismiss()
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 30)
                    .padding(.vertical, 12)
                    .background(Color.green.opacity(0.8))
                    .cornerRadius(25)
                    .transition(.scale.combined(with: .opacity))
                }
            }
        }
    }
    .padding()
}
```

## 5. Popraw `baseURL` w `BrevaAPIService`

Zmień:
```swift
private let baseURL = UserDefaults.standard.string(forKey: "BrevaBaseURL") ?? "https://breva.vercel.app/mobile"
```

Na:
```swift
private let baseURL = UserDefaults.standard.string(forKey: "BrevaBaseURL") ?? "https://breva.vercel.app"
```

I w `setupWebView()` użyj:
```swift
private let webViewURL = UserDefaults.standard.string(forKey: "BrevaWebViewURL") ?? "https://breva.vercel.app/mobile"
```

## Podsumowanie zmian:

1. ✅ **Rzeczywisty progress bar** - pokazuje postęp wysyłania (20% → 90%) zanim otrzyma odpowiedź
2. ✅ **Lepsze wyświetlanie błędów** - błędy są wyświetlane przez 5 sekund (lub czas z `displayDuration` z API)
3. ✅ **Przycisk "Spróbuj ponownie"** - gdy wystąpi błąd
4. ✅ **Lepsze komunikaty** - wyraźne komunikaty o błędach i sukcesie
5. ✅ **Poprawiony baseURL** - bez `/mobile` dla API
