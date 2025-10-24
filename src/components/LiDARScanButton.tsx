"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Camera,
  Smartphone,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface LiDARScanButtonProps {
  onScanComplete?: (data: any) => void;
  onScanError?: (error: string) => void;
  className?: string;
}

// Deklaracja typu dla komunikacji z aplikacją mobilną
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    brevaNativeMessage?: (message: string) => void;
  }
}

export const LiDARScanButton = ({
  onScanComplete,
  onScanError,
  className = "",
}: LiDARScanButtonProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isMobileApp, setIsMobileApp] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);

  const onScanCompleteRef = useRef(onScanComplete);
  const onScanErrorRef = useRef(onScanError);

  // Aktualizuj refs przy zmianie callbacks
  useEffect(() => {
    onScanCompleteRef.current = onScanComplete;
    onScanErrorRef.current = onScanError;
  }, [onScanComplete, onScanError]);

  // Sprawdź czy jesteśmy w aplikacji mobilnej
  useEffect(() => {
    const checkMobileApp = () => {
      const isInWebView = window.ReactNativeWebView !== undefined;
      const hasNativeMessage = window.brevaNativeMessage !== undefined;
      setIsMobileApp(isInWebView || hasNativeMessage);
    };

    checkMobileApp();

    // Nasłuchuj wiadomości z aplikacji mobilnej
    const handleMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data !== "string") return;

        const message = JSON.parse(event.data);

        switch (message.type) {
          case "scan_started":
            setIsScanning(true);
            setError(null);
            setScanProgress(0);
            toast.success("Skanowanie rozpoczęte");
            break;

          case "scan_progress":
            setScanProgress(message.progress || 0);
            break;

          case "scan_completed":
            setIsScanning(false);
            setScanProgress(100);
            setScanResult(message.data);
            onScanCompleteRef.current?.(message.data);
            toast.success("Skanowanie zakończone pomyślnie!");
            break;

          case "scan_error":
            setIsScanning(false);
            setError(message.error);
            onScanErrorRef.current?.(message.error);
            toast.error(`Błąd skanowania: ${message.error}`);
            break;

          case "scan_cancelled":
            setIsScanning(false);
            setScanProgress(0);
            toast.info("Skanowanie anulowane");
            break;
        }
      } catch (error) {
        console.error("Błąd parsowania wiadomości:", error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const startLiDARScan = () => {
    if (!isMobileApp) {
      setError("Ta funkcja działa tylko w aplikacji mobilnej");
      toast.error("Aplikacja mobilna wymagana");
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanProgress(0);
    setScanResult(null);

    const message = {
      type: "startBackgroundCapture",
      timestamp: Date.now(),
      options: {
        quality: "high",
        duration: 30,
        format: "mp4",
      },
    };

    try {
      // Próbuj różne metody komunikacji
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      } else if (window.brevaNativeMessage) {
        window.brevaNativeMessage(JSON.stringify(message));
      } else {
        throw new Error("Brak komunikacji z aplikacją mobilną");
      }

      toast.success("Rozpoczynam skanowanie LiDAR...");
    } catch (error) {
      setIsScanning(false);
      const errorMsg = "Nie udało się uruchomić skanowania";
      setError(errorMsg);
      onScanErrorRef.current?.(errorMsg);
      toast.error(errorMsg);
    }
  };

  const resetScan = () => {
    setIsScanning(false);
    setScanProgress(0);
    setError(null);
    setScanResult(null);
  };

  if (!isMobileApp) {
    return (
      <Card className={`rounded-2xl shadow-lg bg-white ${className}`}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                Aplikacja mobilna wymagana
              </CardTitle>
              <p className="text-sm text-text-muted">
                Skan LiDAR jest dostępny tylko w aplikacji mobilnej
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Smartphone className="h-16 w-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted mb-4">
              Pobierz aplikację BREVA na swój telefon, aby korzystać z
              skanowania LiDAR
            </p>
            <Button variant="outline" className="rounded-xl">
              Pobierz aplikację
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (scanResult) {
    return (
      <Card className={`rounded-2xl shadow-lg bg-white ${className}`}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-green-600">
                Skan zakończony pomyślnie!
              </CardTitle>
              <p className="text-sm text-text-muted">
                Dane LiDAR zostały pobrane
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-muted">Plik:</span>
                  <p className="font-medium">{scanResult.uri || "N/A"}</p>
                </div>
                <div>
                  <span className="text-text-muted">Czas nagrywania:</span>
                  <p className="font-medium">{scanResult.duration || 0}s</p>
                </div>
                <div>
                  <span className="text-text-muted">Data:</span>
                  <p className="font-medium">
                    {new Date(
                      scanResult.timestamp || Date.now()
                    ).toLocaleString("pl-PL")}
                  </p>
                </div>
                <div>
                  <span className="text-text-muted">ID zasobu:</span>
                  <p className="font-medium">{scanResult.assetId || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={resetScan}
                variant="outline"
                className="flex-1 rounded-xl">
                Nowy skan
              </Button>
              <Button className="flex-1 rounded-xl">Prześlij do analizy</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`rounded-2xl shadow-lg bg-white ${className}`}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Camera className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Skan LiDAR</CardTitle>
            <p className="text-sm text-text-muted">
              Najwyższa dokładność analizy objętości
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Skanowanie w toku...</span>
              <span className="font-medium">{scanProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <div className="text-center text-sm text-text-muted">
              <p>Postępuj zgodnie z instrukcjami w aplikacji mobilnej</p>
              <p>• Skanuj obiekt z różnych kątów</p>
              <p>• Utrzymaj stałą odległość</p>
              <p>• Czas skanowania: 30-60 sekund</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="text-center">
            <Camera className="h-16 w-16 text-primary mx-auto mb-4" />
            <p className="text-text-muted mb-4">
              Skanowanie LiDAR zapewnia najwyższą dokładność analizy objętości
              piersi
            </p>
          </div>

          <Button
            onClick={startLiDARScan}
            disabled={isScanning}
            className="w-full rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold py-3 transition-all duration-200 hover:shadow-lg">
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Skanowanie w toku... ({scanProgress}%)
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Rozpocznij skanowanie
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
