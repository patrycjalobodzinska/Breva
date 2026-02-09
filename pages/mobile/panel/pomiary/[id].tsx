import { useState, useEffect, useMemo, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import MobilePanelLayout from "@/components/layout/MobilePanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Calendar,
  TrendingUp,
  BarChart3,
  Edit,
  Trash2,
  ArrowLeft,
  Download,
  Share,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { MeasurementChart } from "@/components/MeasurementChart";
import { AccuracyDisplay } from "@/components/AccuracyDisplay";
import {
  prepareChartData,
  getAsymmetryPercentage,
  getBadgeVariant,
} from "@/utils/measurements";
import { Measurement } from "@/types";
import { Loader } from "@/components/ui/loader";
import {
  useMeasurementValue,
  MeasurementValueResult,
} from "@/hooks/useMeasurementValue";

export default function MobileMeasurementDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = router.query;
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const measurementId =
    typeof id === "string" ? id : Array.isArray(id) ? id[0] : undefined;

  const leftMeasurement = useMeasurementValue(measurementId, "left");
  const rightMeasurement = useMeasurementValue(measurementId, "right");

  const renderMeasurementValue = (info: MeasurementValueResult): ReactNode => {
    switch (info.state) {
      case "value":
        return (
          <div className="text-3xl font-bold text-text-primary">
            {info.value?.toFixed(1)}{" "}
            <span className="text-lg font-semibold">ml</span>
          </div>
        );
      case "pending":
      case "loading":
        return (
          <div className="flex flex-col items-center gap-2">
            <Loader variant="spinner" size="sm" message="Przetwarzanie..." />
          </div>
        );
      case "failed":
        return (
          <div className="text-sm text-center text-red-600">
            Przetwarzanie nie powiodło się
          </div>
        );
      case "empty":
        return (
          <div className="text-sm text-center text-text-muted">Brak danych</div>
        );
      case "error":
      default:
        return (
          <div className="text-sm text-center text-red-600">
            {info.error || "Wystąpił problem z pobieraniem danych"}
          </div>
        );
    }
  };

  const leftVolumeValue =
    typeof measurement?.aiAnalysis?.leftVolumeMl === "number"
      ? measurement.aiAnalysis.leftVolumeMl
      : null;
  const rightVolumeValue =
    typeof measurement?.aiAnalysis?.rightVolumeMl === "number"
      ? measurement.aiAnalysis.rightVolumeMl
      : null;

  const isAdmin = session?.user?.role === "ADMIN";
  const measurementsListPath = isAdmin
    ? "/mobile/admin/pomiary"
    : "/mobile/panel/pomiary";

  useEffect(() => {
    if (id) {
      // Invaliduj cache React Query dla tego pomiaru
      queryClient.invalidateQueries({ queryKey: ["measurement", id] });
      queryClient.invalidateQueries({ queryKey: ["measurements"] });

      // Resetuj stan przed pobraniem nowych danych
      setMeasurement(null);
      setIsLoading(true);

      console.log(
        "🔄 [MEASUREMENT DETAIL] Rozpoczynam pobieranie danych dla ID:",
        id
      );

      // Zawsze pobierz świeże dane przy pierwszym wejściu
      fetchMeasurement(true);
    }
  }, [id, queryClient]); // eslint-disable-line react-hooks/exhaustive-deps

  // Odśwież pomiar po powrocie do widoku (np. po zamknięciu deep linku Swift)
  useEffect(() => {
    if (!id) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("🔄 Odświeżanie pomiaru po powrocie do widoku");
        fetchMeasurement(true); // Force refresh
      }
    };

    const handleFocus = () => {
      console.log("🔄 Odświeżanie pomiaru po focus");
      fetchMeasurement(true); // Force refresh
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMeasurement = async (forceRefresh = false) => {
    if (!id) {
      console.warn("⚠️ [MEASUREMENT] Brak ID - pomijam fetch");
      return;
    }

    try {
      setIsLoading(true);
      console.log("📥 [MEASUREMENT] Rozpoczynam pobieranie pomiaru:", id);

      // Dodaj cache busting timestamp aby zawsze pobrać świeże dane
      const timestamp = forceRefresh ? `?t=${Date.now()}` : "";
      const response = await fetch(`/api/measurements/${id}${timestamp}`, {
        cache: "no-store", // Zawsze pobierz świeże dane
      });

      if (response.ok) {
        const data = await response.json();
        console.log(
          "✅ [MEASUREMENT] Pobrano dane pomiaru:",
          data.id,
          "Has AI Analysis:",
          !!data.aiAnalysis,
          "Has Lidar Captures:",
          data.lidarCaptures?.length || 0
        );
        // Ustaw dane SYNCHRONICZNIE aby uniknąć race condition
        setMeasurement(data);

        // Po ustawieniu measurement, sprawdź statusy LiDAR (nawet jeśli nie ma captures)
        // fetchStatuses() sprawdzi czy są captures i pobierze statusy
        console.log(
          "🔄 [MEASUREMENT] Sprawdzam statusy LiDAR po pobraniu pomiaru"
        );

        setIsLoading(false); // Ustaw false PO ustawieniu measurement i statusów
      } else {
        console.error("❌ [MEASUREMENT] Błąd odpowiedzi:", response.status);
        const errorText = await response.text();
        console.error("❌ [MEASUREMENT] Error body:", errorText);
        toast.error("Nie udało się pobrać pomiaru");
        // Nie przekierowuj od razu - pozwól użytkownikowi zobaczyć błąd
        setMeasurement(null);
        setIsLoading(false); // Ustaw false aby pokazać komunikat błędu
      }
    } catch (error) {
      console.error("❌ [MEASUREMENT] Błąd pobierania:", error);
      toast.error("Wystąpił błąd podczas pobierania pomiaru");
      setMeasurement(null);
      setIsLoading(false); // Ustaw false aby pokazać komunikat błędu
    } finally {
      // NIE ustawiaj isLoading na false tutaj - zrób to tylko w catch/else
      // aby uniknąć race condition gdzie isLoading jest false ale measurement jeszcze null
    }
  };

  const handleDelete = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.stopPropagation();
    }

    if (!measurement || !id) {
      toast.error("Brak danych pomiaru do usunięcia");
      return;
    }

    if (!confirm("Czy na pewno chcesz usunąć ten pomiar?")) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/measurements/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Pomiar został usunięty");
        router.push(measurementsListPath);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Nie udało się usunąć pomiaru");
      }
    } catch (error) {
      console.error("Error deleting measurement:", error);
      toast.error("Wystąpił błąd podczas usuwania pomiaru");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async () => {
    if (!measurement) return;

    try {
      const response = await fetch(`/api/measurements/${id}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pomiar-${measurement?.name}-${
          new Date().toISOString().split("T")[0]
        }.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Raport został pobrany");
      } else {
        toast.error("Nie udało się pobrać raportu");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas pobierania raportu");
    }
  };

  const handleShare = async () => {
    if (!measurement) return;

    const aiAnalysis = measurement?.aiAnalysis;
    const leftVolume =
      leftMeasurement.value ??
      (typeof aiAnalysis?.leftVolumeMl === "number"
        ? aiAnalysis.leftVolumeMl
        : null);
    const rightVolume =
      rightMeasurement.value ??
      (typeof aiAnalysis?.rightVolumeMl === "number"
        ? aiAnalysis.rightVolumeMl
        : null);

    const shareData = {
      title: `Pomiar: ${measurement?.name}`,
      text: `Pomiar piersi - Lewa: ${
        leftVolume !== null ? `${leftVolume.toFixed(1)} ml` : "brak danych"
      }, Prawa: ${
        rightVolume !== null ? `${rightVolume.toFixed(1)} ml` : "brak danych"
      }`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Pomiar został udostępniony");
      } else {
        // Fallback - kopiuj do schowka
        await navigator.clipboard.writeText(shareData.text);
        toast.success("Informacje o pomiarze zostały skopiowane do schowka");
      }
    } catch (error) {
      // Fallback - kopiuj do schowka
      try {
        await navigator.clipboard.writeText(shareData.text);
        toast.success("Informacje o pomiarze zostały skopiowane do schowka");
      } catch (clipboardError) {
        toast.error("Nie udało się udostępnić pomiaru");
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Najpierw sprawdź isLoading - jeśli ładuje, pokaż loader
  if (isLoading) {
    return (
      <MobilePanelLayout>
        <div className="flex items-center justify-center h-64">
          <Loader message="Ładowanie pomiaru..." variant="spinner" />
        </div>
      </MobilePanelLayout>
    );
  }

  // Dopiero potem sprawdź czy measurement istnieje - jeśli nie ma i nie ładuje, to błąd
  if (!measurement) {
    return (
      <MobilePanelLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Image
                src="/logo.png"
                alt="BREVA"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Pomiar nie został znaleziony
            </h3>
            <p className="text-text-muted mb-4">
              Ten pomiar może nie istnieć lub nie masz do niego dostępu
            </p>
            <Button
              onClick={() => router.push(measurementsListPath)}
              className="rounded-xl">
              Wróć do listy pomiarów
            </Button>
          </div>
        </div>
      </MobilePanelLayout>
    );
  }

  // Pobierz dane z measurement (po sprawdzeniu że istnieje)
  const hasManualMeasurement = measurement?.manualAnalysis;
  const aiAnalysis = measurement?.aiAnalysis;
  const manualAnalysis = measurement?.manualAnalysis;

  console.log("📊 [MEASUREMENT DETAIL] Renderowanie z danymi:", measurement.id);
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
          {/* <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="rounded-xl">
              <Share className="h-4 w-4 mr-2" />
              Udostępnij
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="rounded-xl">
              <Download className="h-4 w-4 mr-2" />
              Pobierz
            </Button>
          </div> */}
        </div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-text-primary">
              {measurement?.name}
            </h1>
          </div>
        </div>
        {/* AI Results + status */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span>Lewa pierś (AI)</span>
                </div>
                {leftMeasurement.lastStatus === "FAILED" && (
                  <Badge variant="destructive" className="text-xs">
                    Błąd
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[96px] flex items-center justify-center">
              {renderMeasurementValue(leftMeasurement)}
            </CardContent>
          </Card>
          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span>Prawa pierś (AI)</span>
                </div>
                {rightMeasurement.lastStatus === "FAILED" && (
                  <Badge variant="destructive" className="text-xs">
                    Błąd
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[96px] flex items-center justify-center">
              {renderMeasurementValue(rightMeasurement)}
            </CardContent>
          </Card>
        </div>
        {/* Manual Measurements */}
        {hasManualMeasurement && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary">
              Pomiar ręczny
            </h2>
            <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-text-muted text-sm">Lewa pierś (ml)</p>
                    <p className="text-xl font-semibold text-text-primary">
                      {manualAnalysis?.leftVolumeMl
                        ? manualAnalysis?.leftVolumeMl?.toFixed(1) + " ml"
                        : "Brak danych"}{" "}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-sm">Prawa pierś (ml)</p>
                    <p className="text-xl font-semibold text-text-primary">
                      {manualAnalysis?.rightVolumeMl
                        ? manualAnalysis?.rightVolumeMl?.toFixed(1) + " ml"
                        : "Brak danych"}{" "}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Chart */}
        {(() => {
          const chartData = prepareChartData(measurement);
          return (
            <MeasurementChart
              data={chartData}
              title="Porównanie AI vs Pomiary ręczne"
              description="Wykres porównujący wyniki AI z pomiarami ręcznymi"
            />
          );
        })()}
        {/* Note */}
        {measurement?.note && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary">Notatka</h2>
            <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <p className="text-text-muted">{measurement?.note}</p>
              </CardContent>
            </Card>
          </div>
        )}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/mobile/panel/pomiary/${id}/edit`)}
            className="flex-1 rounded-xl">
            <Edit className="h-4 w-4 mr-2" />
            Edytuj
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting || !measurement || !id}
            className="flex-1 rounded-xl text-red-600 border-red-200 hover:bg-red-50">
            {isDeleting ? (
              <>
                <Loader
                  variant="default"
                  size="sm"
                  message=""
                  className="mr-2"
                />
                Usuwanie...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Usuń
              </>
            )}
          </Button>
        </div>
      </div>
    </MobilePanelLayout>
  );
}
