"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Camera, AlertCircle, CheckCircle } from "lucide-react";

interface WebViewBridgeProps {
  onLiDARData?: (data: any) => void;
}

export const WebViewBridge = ({ onLiDARData }: WebViewBridgeProps) => {
  const [isMobileApp, setIsMobileApp] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sprawdź czy jesteśmy w aplikacji mobilnej
    const checkMobileApp = () => {
      const isInWebView = window.ReactNativeWebView !== undefined;
      setIsMobileApp(isInWebView);
    };

    checkMobileApp();

    // Nasłuchuj wiadomości z aplikacji mobilnej
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "lidar_data":
            setScanResult(message.data);
            setIsScanning(false);
            onLiDARData?.(message.data);
            break;
          case "lidar_error":
            setError(message.error);
            setIsScanning(false);
            break;
          case "lidar_cancelled":
            setIsScanning(false);
            break;
        }
      } catch (error) {
        console.error("Błąd parsowania wiadomości:", error);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onLiDARData]);

  const requestLiDARScan = () => {
    if (!isMobileApp) {
      setError("Ta funkcja działa tylko w aplikacji mobilnej");
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    const message = {
      type: "request_lidar",
    };

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setError(null);
  };

  if (!isMobileApp) {
    return (
      <Card className="rounded-2xl shadow-lg bg-white">
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

  return (
    <Card className="rounded-2xl shadow-lg bg-white">
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

        {scanResult ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Skan zakończony pomyślnie!</span>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-muted">Plik:</span>
                  <p className="font-medium">{scanResult.uri}</p>
                </div>
                <div>
                  <span className="text-text-muted">Czas nagrywania:</span>
                  <p className="font-medium">{scanResult.duration}s</p>
                </div>
                <div>
                  <span className="text-text-muted">Data:</span>
                  <p className="font-medium">
                    {new Date(scanResult.timestamp).toLocaleString("pl-PL")}
                  </p>
                </div>
                <div>
                  <span className="text-text-muted">ID zasobu:</span>
                  <p className="font-medium">{scanResult.assetId}</p>
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
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <Camera className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-text-muted mb-4">
                Skanowanie LiDAR zapewnia najwyższą dokładność analizy objętości
                piersi
              </p>
            </div>

            <Button
              onClick={requestLiDARScan}
              disabled={isScanning}
              className="w-full rounded-xl">
              {isScanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Skanowanie w toku...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Rozpocznij skan LiDAR
                </>
              )}
            </Button>

            {isScanning && (
              <div className="text-center text-sm text-text-muted">
                <p>Postępuj zgodnie z instrukcjami w aplikacji mobilnej</p>
                <p>• Skanuj obiekt z różnych kątów</p>
                <p>• Utrzymuj stałą odległość</p>
                <p>• Czas skanowania: 30-60 sekund</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
