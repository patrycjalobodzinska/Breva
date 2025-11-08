import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import MobilePanelLayout from "@/components/layout/MobilePanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
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

export default function MobileMeasurementDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [leftStatus, setLeftStatus] = useState<string | null>(null);
  const [rightStatus, setRightStatus] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";
  const measurementsListPath = isAdmin
    ? "/mobile/admin/pomiary"
    : "/mobile/panel/pomiary";

  useEffect(() => {
    if (id) {
      // Resetuj stan przed pobraniem nowych danych
      setMeasurement(null);
      setIsLoading(true);
      // Zawsze pobierz świeże dane przy pierwszym wejściu
      fetchMeasurement(true);
      fetchStatuses();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Odśwież pomiar po powrocie do widoku (np. po zamknięciu deep linku Swift)
  useEffect(() => {
    if (!id) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("🔄 Odświeżanie pomiaru po powrocie do widoku");
        fetchMeasurement(true); // Force refresh
        fetchStatuses();
      }
    };

    const handleFocus = () => {
      console.log("🔄 Odświeżanie pomiaru po focus");
      fetchMeasurement(true); // Force refresh
      fetchStatuses();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [id]);

  useEffect(() => {
    if (!isPolling) return;
    const t = setInterval(() => {
      fetchStatuses();
      fetchMeasurement();
    }, 5000);
    return () => clearInterval(t);
  }, [isPolling]);

  const fetchMeasurement = async (forceRefresh = false) => {
    if (!id) return;

    try {
      setIsLoading(true);
      // Dodaj cache busting timestamp aby zawsze pobrać świeże dane
      const timestamp = forceRefresh ? `?t=${Date.now()}` : "";
      const response = await fetch(`/api/measurements/${id}${timestamp}`, {
        cache: "no-store", // Zawsze pobierz świeże dane
      });
      if (response.ok) {
        const data = await response.json();
        setMeasurement(data);
        console.log("✅ [MEASUREMENT] Pobrano dane pomiaru:", data.id);
      } else {
        toast.error("Nie udało się pobrać pomiaru");
        router.push(measurementsListPath);
      }
    } catch (error) {
      console.error("❌ [MEASUREMENT] Błąd pobierania:", error);
      toast.error("Wystąpił błąd podczas pobierania pomiaru");
      router.push(measurementsListPath);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!measurement) return;

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
        toast.error("Nie udało się usunąć pomiaru");
      }
    } catch (error) {
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
    const leftVolume = aiAnalysis?.leftVolumeMl || 0;
    const rightVolume = aiAnalysis?.rightVolumeMl || 0;

    const shareData = {
      title: `Pomiar: ${measurement?.name}`,
      text: `Pomiar piersi - Lewa: ${leftVolume.toFixed(
        1
      )}ml, Prawa: ${rightVolume.toFixed(1)}ml`,
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

  const fetchStatuses = async () => {
    const mid = Array.isArray(id) ? id[0] : (id as string);
    if (!mid) return;
    try {
      const l = await fetch(
        `/api/lidar-capture/status?measurementId=${encodeURIComponent(
          mid
        )}&side=left`
      );
      if (l.ok) {
        const d = await l.json();
        setLeftStatus(d.status);
      }
    } catch {}
    try {
      const r = await fetch(
        `/api/lidar-capture/status?measurementId=${encodeURIComponent(
          mid
        )}&side=right`
      );
      if (r.ok) {
        const d = await r.json();
        setRightStatus(d.status);
      }
    } catch {}
    setIsPolling(leftStatus === "PENDING" || rightStatus === "PENDING");
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

  const getVolumeDifference = (left: number, right: number) => {
    const diff = Math.abs(left - right);
    const percentage = ((diff / Math.max(left, right)) * 100).toFixed(1);
    return { diff, percentage };
  };

  const hasManualMeasurement = measurement?.manualAnalysis;
  const aiAnalysis = measurement?.aiAnalysis;
  const manualAnalysis = measurement?.manualAnalysis;

  if (isLoading) {
    return (
      <MobilePanelLayout>
        <Loader
          message="Ładowanie pomiaru..."
          variant="spinner"
          className="h-64"
        />
      </MobilePanelLayout>
    );
  }

  if (!measurement) {
    return (
      <MobilePanelLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-red-600" />
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
  console.log(measurement);
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
                {leftStatus === "FAILED" && (
                  <Badge variant="destructive" className="text-xs">
                    Błąd
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leftStatus === "PENDING" && !aiAnalysis?.leftVolumeMl ? (
                <div className="flex items-center">
                  <Loader
                    variant="default"
                    size="sm"
                    message=""
                    className="mr-2"
                  />
                  <span>Przetwarzanie...</span>
                </div>
              ) : leftStatus === "FAILED" ? (
                <div className="text-sm text-red-600">
                  <p className="font-medium">Przetwarzanie nie powiodło się</p>
                  <p className="text-xs text-text-muted mt-1">
                    Wyślij skan ponownie
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-text-primary">
                  {aiAnalysis?.leftVolumeMl
                    ? aiAnalysis?.leftVolumeMl?.toFixed(1) + " ml"
                    : "Brak danych"}
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span>Prawa pierś (AI)</span>
                </div>
                {rightStatus === "FAILED" && (
                  <Badge variant="destructive" className="text-xs">
                    Błąd
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rightStatus === "PENDING" && !aiAnalysis?.rightVolumeMl ? (
                <div className="flex items-center">
                  <Loader
                    variant="default"
                    size="sm"
                    message=""
                    className="mr-2"
                  />
                  <span>Przetwarzanie...</span>
                </div>
              ) : rightStatus === "FAILED" ? (
                <div className="text-sm text-red-600">
                  <p className="font-medium">Przetwarzanie nie powiodło się</p>
                  <p className="text-xs text-text-muted mt-1">
                    Wyślij skan ponownie
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-text-primary">
                  {aiAnalysis?.rightVolumeMl
                    ? aiAnalysis?.rightVolumeMl?.toFixed(1) + " ml"
                    : "Brak danych"}
                </p>
              )}
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
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting}
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
