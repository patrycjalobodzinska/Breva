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

import { AlertCircle, CheckCircle, Camera, Upload, Heart } from "lucide-react";
import { toast } from "sonner";

export default function MobileUploadPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [measurementId, setMeasurementId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    note: "",
  });

  const {
    measurement,
    isLoading: isMeasurementLoading,
    fetchMeasurement,
  } = useMeasurementDetail(measurementId as string);

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
        setMeasurementId(createdMeasurement?.id);
        queryClient.invalidateQueries({ queryKey: ["measurements"] });
        toast.success("Pomiar został utworzony!");
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
    return measurement.lidarCaptures.find((c) => c.side === side.toUpperCase());
  };

  const isLidarSent = (side: "left" | "right") => {
    const capture = getLidarStatusForSide(side);
    return capture !== null && capture !== undefined;
  };

  const isAnalysisComplete = (side: "left" | "right") => {
    const capture = getLidarStatusForSide(side);
    return capture && capture.status === "COMPLETED" && capture.estimatedVolume;
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
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <Heart className="h-5 w-5 text-pink-600" />
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
                {isLidarSent("left") ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-text-primary">
                      Przesłano pomyślnie
                    </p>
                    <Button
                      onClick={() =>
                        router.push(`/mobile/panel/pomiary/${measurementId}`)
                      }
                      className="w-full rounded-xl mt-3">
                      Przejdź do analizy
                    </Button>
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
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Heart className="h-5 w-5 text-blue-600" />
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
                {isLidarSent("right") ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-text-primary">
                      Przesłano pomyślnie
                    </p>
                    <Button
                      onClick={() =>
                        router.push(`/mobile/panel/pomiary/${measurementId}`)
                      }
                      className="w-full rounded-xl mt-3">
                      Przejdź do analizy
                    </Button>
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
              disabled={!isLidarSent("left") && !isLidarSent("right")}
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
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
