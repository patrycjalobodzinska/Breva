import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import MobilePanelLayout from "@/components/layout/MobilePanelLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMeasurementDetail } from "@/hooks/useMeasurementDetail";
import { Measurement } from "@/types";

import Image from "next/image";
import {
  AlertCircle,
  CheckCircle,
  Camera,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";

export default function MobileUploadPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    note: "",
  });

  // Pobierz ID z URL jeśli istnieje
  const measurementId = router.query.id as string | undefined;

  const {
    measurement,
    isLoading: isMeasurementLoading,
    isRefreshing,
    fetchMeasurement,
  } = useMeasurementDetail(measurementId as string);

  // Odśwież pomiar po powrocie do widoku (np. po zamknięciu deep linku)
  useEffect(() => {
    if (measurementId) {
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          console.log("🔄 Odświeżanie pomiaru po powrocie do widoku");
          // Odśwież natychmiast, aby zobaczyć nowe capture'y
          fetchMeasurement(false); // false = odświeżanie (nie pokaże loaderów)

          // Odśwież jeszcze raz po krótkiej chwili, aby mieć pewność że dane są aktualne
          setTimeout(() => {
            fetchMeasurement(false);
          }, 1000);
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Odśwież też gdy użytkownik wróci przez fokus (dla WebView)
      const handleFocus = () => {
        console.log("🔄 Odświeżanie pomiaru po focus");
        fetchMeasurement(false); // false = odświeżanie (nie pokaże loaderów)

        // Odśwież jeszcze raz po krótkiej chwili
        setTimeout(() => {
          fetchMeasurement(false);
        }, 1000);
      };

      window.addEventListener("focus", handleFocus);

      // Odśwież również gdy komponent się mountuje (dla przypadku gdy użytkownik wraca na stronę)
      fetchMeasurement(false);
      setTimeout(() => {
        fetchMeasurement(false);
      }, 1000);

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        window.removeEventListener("focus", handleFocus);
      };
    }
  }, [measurementId, fetchMeasurement]);

  // Automatyczne odświeżanie co 3 sekundy gdy pomiar jest w trakcie przetwarzania lub gdy są FAILED
  useEffect(() => {
    if (!measurementId || !measurement) return;

    // Sprawdź czy któryś z captureów jest w statusie PENDING
    const hasPendingCaptures = measurement.lidarCaptures?.some(
      (c) => c.status === "PENDING"
    );

    // Sprawdź czy któryś z captureów jest w statusie FAILED (może się zmienić z PENDING na FAILED)
    const hasFailedCaptures = measurement.lidarCaptures?.some(
      (c) => c.status === "FAILED"
    );

    // Sprawdź czy nie ma jeszcze wyników w aiAnalysis dla PENDING captureów
    const leftPending = measurement.lidarCaptures?.find(
      (c) => c.side === "LEFT" && c.status === "PENDING"
    );
    const rightPending = measurement.lidarCaptures?.find(
      (c) => c.side === "RIGHT" && c.status === "PENDING"
    );

    const leftHasResult = leftPending && measurement?.aiAnalysis?.leftVolumeMl;
    const rightHasResult =
      rightPending && measurement?.aiAnalysis?.rightVolumeMl;

    const hasProcessing =
      hasPendingCaptures && (!leftHasResult || !rightHasResult);

    // Sprawdź czy wszystkie capture'y są zakończone (COMPLETED lub FAILED)
    const allCapturesFinished = measurement.lidarCaptures?.every(
      (c) => c.status === "COMPLETED" || c.status === "FAILED"
    );

    // Polling jest aktywny TYLKO gdy:
    // 1. Są PENDING capture'y bez wyników (przetwarzanie w toku)
    // 2. NIE są wszystkie zakończone
    // NIE pollujemy dla FAILED - one już są zakończone!
    const shouldPoll = hasProcessing && !allCapturesFinished;

    if (shouldPoll) {
      console.log(
        "⏱️ Start pollingu - przetwarzanie LiDAR lub sprawdzanie FAILED"
      );
      const interval = setInterval(() => {
        console.log("🔄 Polling - odświeżanie pomiaru");
        fetchMeasurement(false); // false = odświeżanie (nie pokaże loaderów)
      }, 3000); // Co 3 sekundy

      return () => {
        console.log("⏱️ Stop pollingu");
        clearInterval(interval);
      };
    } else {
      console.log(
        "🛑 Brak przetwarzających się captureów - polling zatrzymany"
      );
    }
  }, [measurementId, measurement, fetchMeasurement]);

  const handleCreateMeasurement = async () => {
    if (!formData.name.trim()) {
      toast.error("Nazwa pomiaru jest wymagana");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/measurements/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const createdMeasurement = await response.json();
        queryClient.invalidateQueries({ queryKey: ["measurements"] });
        toast.success("Pomiar został utworzony!");
        // Przekieruj na URL z ID pomiaru
        router.push(`/mobile/panel/przesylanie/${createdMeasurement?.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Błąd podczas tworzenia pomiaru");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas tworzenia pomiaru");
    } finally {
      setIsCreating(false);
    }
  };

  const handleLiDARCapture = (side: "left" | "right") => {
    const deepLink = `breva://capture-lidar?side=${side}&measurementId=${measurementId}`;
    window.location.href = deepLink;
  };

  const getLidarStatusForSide = (side: "left" | "right") => {
    if (!measurement?.lidarCaptures) return null;
    // Znajdź wszystkie capture'y dla tej strony i zwróć najnowszy (najpóźniejszy createdAt)
    const captures = measurement.lidarCaptures.filter(
      (c) => c.side === side.toUpperCase()
    );
    if (captures.length === 0) return null;

    // Sortuj po createdAt (najnowszy pierwszy) i zwróć pierwszy
    return captures.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Najnowszy pierwszy
    })[0];
  };

  const isLidarSent = (side: "left" | "right") => {
    const capture = getLidarStatusForSide(side);
    return capture !== null && capture !== undefined;
  };

  const isAnalysisComplete = (side: "left" | "right") => {
    const capture = getLidarStatusForSide(side);
    return capture && capture.status === "COMPLETED" && capture.estimatedVolume;
  };

  const isProcessing = (side: "left" | "right") => {
    const capture = getLidarStatusForSide(side);
    const aiAnalysis = measurement?.aiAnalysis;
    const volumeField = side === "left" ? "leftVolumeMl" : "rightVolumeMl";

    // Przetwarzanie jeśli:
    // 1. Capture istnieje i ma status PENDING (nie FAILED!)
    // 2. Lub capture istnieje, nie jest FAILED i nie ma jeszcze wyniku w aiAnalysis
    return (
      (capture && capture.status === "PENDING") ||
      (capture && capture.status !== "FAILED" && !aiAnalysis?.[volumeField])
    );
  };

  const isFailed = (side: "left" | "right") => {
    const capture = getLidarStatusForSide(side);
    return capture && capture.status === "FAILED";
  };

  const getVolumeResult = (side: "left" | "right") => {
    const aiAnalysis = measurement?.aiAnalysis;
    const volumeField = side === "left" ? "leftVolumeMl" : "rightVolumeMl";
    return aiAnalysis?.[volumeField];
  };

  if (measurementId) {
    return (
      <MobilePanelLayout>
        <div className="space-y-4 h-full">
          <div>
            <h1 className="text-lg font-bold text-text-primary">
              Analiza piersi
            </h1>
            <p className="text-text-muted text-sm">
              Wykonaj skan LiDAR dla każdej piersi osobno
            </p>
          </div>

          {/* Lewa pierś */}
          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full border border-pink-500 flex items-center justify-center bg-white">
                  <Image
                    src="/logo.png"
                    alt="BREVA"
                    width={20}
                    height={20}
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">
                    Lewa pierś
                  </h3>
                  <p className="text-xs text-text-muted">
                    Najwyższa dokładność
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {isMeasurementLoading && !measurement ? (
                  <div className="text-center py-4">
                    <Loader variant="default" size="md" message="" />
                    <p className="text-sm font-medium text-text-muted mt-2">
                      Ładowanie...
                    </p>
                  </div>
                ) : isFailed("left") ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-sm font-medium text-red-600">
                      Przetwarzanie nie powiodło się
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Spróbuj ponownie przesłać skan
                    </p>
                    <button
                      onClick={() => handleLiDARCapture("left")}
                      className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">
                      Wyślij ponownie
                    </button>
                  </div>
                ) : isProcessing("left") ? (
                  <div className="text-center py-4">
                    <Loader variant="default" size="md" message="" />
                    <p className="text-sm font-medium text-text-primary mt-2">
                      Przetwarzanie...
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Analiza danych LiDAR w toku
                    </p>
                  </div>
                ) : isLidarSent("left") ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-text-primary">
                      Przesłano pomyślnie
                    </p>
                    {/* {getVolumeResult("left") && (
                      <p className="text-lg font-bold text-primary mt-2">
                        {getVolumeResult("left")?.toFixed(1)} ml
                      </p>
                    )} */}
                    {/* <Button
                      onClick={() =>
                        router.push(`/mobile/panel/pomiary/${measurementId}`)
                      }
                      className="w-full rounded-xl mt-3">
                      Przejdź do analizy
                    </Button> */}
                  </div>
                ) : (
                  <Button
                    onClick={() => handleLiDARCapture("left")}
                    className="w-full rounded-xl py-3 text-base font-semibold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white">
                    <Camera className="h-4 w-4 mr-2" />
                    Skan LiDAR
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Prawa pierś */}
          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full border border-blue-500 flex items-center justify-center bg-white">
                  <Image
                    src="/logo.png"
                    alt="BREVA"
                    width={20}
                    height={20}
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">
                    Prawa pierś
                  </h3>
                  <p className="text-xs text-text-muted">
                    Najwyższa dokładność
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {isMeasurementLoading && !measurement ? (
                  <div className="text-center py-4">
                    <Loader variant="default" size="md" message="" />
                    <p className="text-sm font-medium text-text-muted mt-2">
                      Ładowanie...
                    </p>
                  </div>
                ) : isFailed("right") ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-sm font-medium text-red-600">
                      Przetwarzanie nie powiodło się
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Spróbuj ponownie przesłać skan
                    </p>
                    <button
                      onClick={() => handleLiDARCapture("right")}
                      className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">
                      Wyślij ponownie
                    </button>
                  </div>
                ) : isProcessing("right") ? (
                  <div className="text-center py-4">
                    <Loader variant="default" size="md" message="" />
                    <p className="text-sm font-medium text-text-primary mt-2">
                      Przetwarzanie...
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Analiza danych LiDAR w toku
                    </p>
                  </div>
                ) : isLidarSent("right") ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-text-primary">
                      Przesłano pomyślnie
                    </p>
                    {/* {getVolumeResult("right") && (
                      <p className="text-lg font-bold text-primary mt-2">
                        {getVolumeResult("right")?.toFixed(1)} ml
                      </p>
                    )} */}
                    {/* <Button
                      onClick={() =>
                        router.push(`/mobile/panel/pomiary/${measurementId}`)
                      }
                      className="w-full rounded-xl mt-3">
                      Przejdź do analizy
                    </Button> */}
                  </div>
                ) : (
                  <Button
                    onClick={() => handleLiDARCapture("right")}
                    className="w-full rounded-xl py-3 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                    <Camera className="h-4 w-4 mr-2" />
                    Skan LiDAR
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-3 pb-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 rounded-xl">
              Anuluj
            </Button>
            <Button
              onClick={() =>
                router.push(`/mobile/panel/pomiary/${measurementId}`)
              }
              // disabled={!isLidarSent("left") && !isLidarSent("right")}
              className="flex-1 rounded-xl">
              <CheckCircle className="h-4 w-4 mr-2" />
              Przejdź do analizy
            </Button>
          </div>
        </div>
      </MobilePanelLayout>
    );
  }

  return (
    <MobilePanelLayout>
      <div className="space-y-4 h-full">
        <div>
          <h1 className="text-lg font-bold text-text-primary">Nowy pomiar</h1>
          <p className="text-text-muted text-sm">
            Utwórz nowy pomiar i wykonaj analizę obu piersi
          </p>
        </div>

        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa pomiaru</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="np. Pomiar kontrolny"
                className="rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Notatka (opcjonalnie)</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, note: e.target.value }))
                }
                placeholder="Dodatkowe informacje o pomiarze..."
                className="rounded-xl"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Wskazówki</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Użyj dobrego oświetlenia</li>
                <li>• Unikaj cieni na piersiach</li>
                <li>• Skanuj każdą pierś osobno</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pb-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 rounded-xl">
            Anuluj
          </Button>
          <Button
            onClick={handleCreateMeasurement}
            disabled={isCreating || !formData.name.trim()}
            className="flex-1 rounded-xl">
            {isCreating ? (
              <>
                <Loader
                  variant="default"
                  size="sm"
                  message=""
                  className="mr-2"
                />
                Tworzenie...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Utwórz pomiar
              </>
            )}
          </Button>
        </div>
      </div>
    </MobilePanelLayout>
  );
}
