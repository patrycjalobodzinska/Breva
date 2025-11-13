import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import MobilePanelLayout from "@/components/layout/MobilePanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, X, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { useMeasurementDetail } from "@/hooks/useMeasurementDetail";
import { Measurement } from "@/types";

interface LidarStatus {
  status: "PENDING" | "COMPLETED" | "FAILED";
  estimatedVolume?: number;
}

export default function MobileMeasurementEditPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const { measurement, isLoading, fetchMeasurement } = useMeasurementDetail(
    id as string
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingManual, setIsEditingManual] = useState(false);
  const [leftStatus, setLeftStatus] = useState<LidarStatus | null>(null);
  const [rightStatus, setRightStatus] = useState<LidarStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    note: "",
  });

  const [manualForm, setManualForm] = useState({
    leftVolumeMl: "",
    rightVolumeMl: "",
  });

  useEffect(() => {
    if (measurement) {
      setEditForm({
        name: measurement.name,
        note: measurement.note || "",
      });
    }
  }, [measurement]);

  useEffect(() => {
    if (id) {
      fetchStatuses();
    }
  }, [id]);

  useEffect(() => {
    if (!isPolling) return;
    const t = setInterval(() => {
      fetchStatuses();
      fetchMeasurement();
    }, 5000);
    return () => clearInterval(t);
  }, [isPolling, fetchMeasurement]);

  const handleSaveEdit = async () => {
    if (!measurement) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/measurements/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast.success("Pomiar został zaktualizowany");
        // Odśwież dane przed przekierowaniem
        await fetchMeasurement(true);
        router.push(`/mobile/panel/pomiary/${id}`);
      } else {
        toast.error("Nie udało się zaktualizować pomiaru");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas aktualizacji pomiaru");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveManual = async () => {
    if (!measurement) return;

    try {
      setIsSaving(true);
      // Upsert manual przez POST /manual
      const response = await fetch(`/api/measurements/${id}/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leftVolumeMl: parseFloat(manualForm.leftVolumeMl),
          rightVolumeMl: parseFloat(manualForm.rightVolumeMl),
        }),
      });

      if (response.ok) {
        toast.success("Pomiar ręczny zapisany");
      } else {
        toast.error("Nie udało się zapisać pomiaru ręcznego");
      }

      setManualForm({ leftVolumeMl: "", rightVolumeMl: "" });
      setIsEditingManual(false);
      fetchMeasurement();
    } catch (error) {
      toast.error("Wystąpił błąd podczas zapisywania pomiaru ręcznego");
    } finally {
      setIsSaving(false);
    }
  };

  const startEditManual = () => {
    if (measurement?.manualAnalysis) {
      setManualForm({
        leftVolumeMl: (
          measurement.manualAnalysis.leftVolumeMl ?? ""
        ).toString(),
        rightVolumeMl: (
          measurement.manualAnalysis.rightVolumeMl ?? ""
        ).toString(),
      });
    } else {
      setManualForm({ leftVolumeMl: "", rightVolumeMl: "" });
    }
    setIsEditingManual(true);
  };

  const triggerLidar = (side: "left" | "right") => {
    const mid = Array.isArray(id) ? id[0] : (id as string);
    if (!mid) return;
    const url = `breva://capture-lidar?measurementId=${encodeURIComponent(
      mid
    )}&side=${side}`;
    window.location.href = url;
    if (side === "left") setLeftStatus({ status: "PENDING" });
    if (side === "right") setRightStatus({ status: "PENDING" });
    setIsPolling(true);
  };

  const fetchStatuses = async () => {
    const mid = Array.isArray(id) ? id[0] : (id as string);
    if (!mid) return;

    // Zapisz poprzednie statusy aby wykryć zmiany
    const previousLeftStatus = leftStatus?.status;
    const previousRightStatus = rightStatus?.status;

    let newLeftStatus: LidarStatus | null = null;
    let newRightStatus: LidarStatus | null = null;
    let leftCompleted = false;
    let rightCompleted = false;

    try {
      const l = await fetch(
        `/api/lidar-capture/status?measurementId=${encodeURIComponent(
          mid
        )}&side=left`,
        { cache: "no-store" }
      );
      if (l.ok) {
        const d = await l.json();
        newLeftStatus = { status: d.status, estimatedVolume: d.estimatedVolume };
        setLeftStatus(newLeftStatus);

        // Sprawdź czy status zmienił się na COMPLETED
        if (d.status === "COMPLETED" && previousLeftStatus !== "COMPLETED") {
          leftCompleted = true;
        }
      }
    } catch {}
    try {
      const r = await fetch(
        `/api/lidar-capture/status?measurementId=${encodeURIComponent(
          mid
        )}&side=right`,
        { cache: "no-store" }
      );
      if (r.ok) {
        const d = await r.json();
        newRightStatus = {
          status: d.status,
          estimatedVolume: d.estimatedVolume,
        };
        setRightStatus(newRightStatus);

        // Sprawdź czy status zmienił się na COMPLETED
        if (d.status === "COMPLETED" && previousRightStatus !== "COMPLETED") {
          rightCompleted = true;
        }
      }
    } catch {}

    const pending =
      newLeftStatus?.status === "PENDING" || newRightStatus?.status === "PENDING";
    setIsPolling(pending);

    // Jeśli którykolwiek status zmienił się na COMPLETED, odśwież dane pomiaru
    if (leftCompleted || rightCompleted) {
      console.log("🔄 [STATUS] Odświeżanie danych pomiaru po zakończeniu przetwarzania");
      await fetchMeasurement(true);
    }
  };
  console.log(measurement);
  if (isLoading) {
    return (
      <MobilePanelLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-muted">Ładowanie pomiaru...</p>
          </div>
        </div>
      </MobilePanelLayout>
    );
  }

  if (!measurement) {
    return (
      <MobilePanelLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Pomiar nie został znaleziony
            </h3>
            <Button
              onClick={() => router.push("/mobile/panel/pomiary")}
              className="rounded-xl">
              Wróć do listy pomiarów
            </Button>
          </div>
        </div>
      </MobilePanelLayout>
    );
  }

  return (
    <MobilePanelLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Wróć
          </Button>
          <Button
            onClick={handleSaveEdit}
            disabled={isSaving}
            className="rounded-xl">
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Zapisywanie...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Zapisz
              </>
            )}
          </Button>
        </div>

        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Edit3 className="h-5 w-5 mr-2" />
              Edycja pomiaru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa pomiaru</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="Nazwa pomiaru"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Notatka</Label>
              <Textarea
                id="note"
                value={editForm.note}
                onChange={(e) =>
                  setEditForm({ ...editForm, note: e.target.value })
                }
                placeholder="Dodatkowe informacje o pomiarze..."
                className="rounded-xl"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-text-primary">
                  {measurement?.aiAnalysis?.leftVolumeMl?.toFixed(1) ?? "0.0"}ml
                </div>
                <div className="text-sm text-text-muted">Lewa pierś</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-text-primary">
                  {measurement?.aiAnalysis?.rightVolumeMl?.toFixed(1) ?? "0.0"}
                  ml
                </div>
                <div className="text-sm text-text-muted">Prawa pierś</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Edit3 className="h-5 w-5 mr-2" />
                Skan LiDAR
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="text-sm text-text-muted mb-1">Lewa</div>
                {leftStatus ? (
                  <>
                    <div className="mb-2">
                      <span className="text-green-600 font-medium">
                        Juz przesłano
                      </span>
                    </div>
                    {leftStatus.status === "PENDING" ? (
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                        <span>Przetwarzanie...</span>
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-text-primary mb-2">
                        {measurement?.aiAnalysis?.leftVolumeMl?.toFixed(1) ??
                          "0.0"}{" "}
                        ml
                      </div>
                    )}
                  </>
                ) : (
                  <Button
                    onClick={() => triggerLidar("left")}
                    className="rounded-xl w-full">
                    Zrób zdjęcie LiDAR (lewa)
                  </Button>
                )}
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="text-sm text-text-muted mb-1">Prawa</div>
                {rightStatus ? (
                  <>
                    <div className="mb-2">
                      <span className="text-green-600 font-medium">
                        Juz przesłano
                      </span>
                    </div>
                    {rightStatus.status === "PENDING" ? (
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                        <span>Przetwarzanie...</span>
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-text-primary mb-2">
                        {measurement?.aiAnalysis?.rightVolumeMl?.toFixed(1) ??
                          "0.0"}{" "}
                        ml
                      </div>
                    )}
                  </>
                ) : (
                  <Button
                    onClick={() => triggerLidar("right")}
                    className="rounded-xl w-full">
                    Zrób zdjęcie LiDAR (prawa)
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Edit3 className="h-5 w-5 mr-2" />
                Pomiar ręczny
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={startEditManual}
                className="rounded-xl">
                <Edit3 className="h-4 w-4 mr-2" />
                {measurement?.manualAnalysis ? "Edytuj" : "Dodaj"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditingManual && (
              <div className="space-y-4 mb-4 p-4 bg-blue-50 rounded-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manualLeft">Lewa pierś (ml)</Label>
                    <Input
                      id="manualLeft"
                      type="number"
                      step="0.1"
                      value={manualForm.leftVolumeMl}
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          leftVolumeMl: e.target.value,
                        })
                      }
                      placeholder="0.0"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manualRight">Prawa pierś (ml)</Label>
                    <Input
                      id="manualRight"
                      type="number"
                      step="0.1"
                      value={manualForm.rightVolumeMl}
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          rightVolumeMl: e.target.value,
                        })
                      }
                      placeholder="0.0"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveManual}
                    disabled={isSaving}
                    className="flex-1 rounded-xl">
                    {isSaving ? "Zapisywanie..." : "Zapisz"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingManual(false);
                      setManualForm({
                        leftVolumeMl: "",
                        rightVolumeMl: "",
                      });
                    }}
                    className="rounded-xl">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {measurement?.manualAnalysis ? (
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-text-muted">
                      {measurement.manualAnalysis.leftVolumeMl?.toFixed(1) ??
                        "0.0"}
                      ml
                      {" / "}
                      {measurement.manualAnalysis.rightVolumeMl?.toFixed(1) ??
                        "0.0"}
                      ml
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-text-muted mb-4">
                  Brak pomiaru ręcznego
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MobilePanelLayout>
  );
}
