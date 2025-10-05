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
} from "lucide-react";
import { toast } from "sonner";
import { MeasurementChart } from "@/components/MeasurementChart";

interface Measurement {
  id: string;
  name: string;
  note?: string;
  source: "AI" | "MANUAL";
  leftVolumeMl: number;
  rightVolumeMl: number;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
  manualItems?: {
    id: string;
    name: string;
    leftVolumeMl: number;
    rightVolumeMl: number;
    createdAt: string;
  }[];
}

export default function MobileMeasurementDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMeasurement();
    }
  }, [id]);

  const fetchMeasurement = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/measurements/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMeasurement(data);
      } else {
        toast.error("Nie udało się pobrać pomiaru");
        router.push("/mobile/panel/pomiary");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas pobierania pomiaru");
      router.push("/mobile/panel/pomiary");
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
        router.push("/mobile/panel/pomiary");
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
        a.download = `pomiar-${measurement.name}-${
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

    const shareData = {
      title: `Pomiar: ${measurement.name}`,
      text: `Pomiar piersi - Lewa: ${measurement.leftVolumeMl.toFixed(
        1
      )}ml, Prawa: ${measurement.rightVolumeMl.toFixed(1)}ml`,
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

  const getVolumeDifference = (left: number, right: number) => {
    const diff = Math.abs(left - right);
    const percentage = ((diff / Math.max(left, right)) * 100).toFixed(1);
    return { diff, percentage };
  };

  const getChartData = () => {
    if (!measurement) return [];

    const data = [
      {
        name: measurement.name,
        left: measurement.leftVolumeMl,
        right: measurement.rightVolumeMl,
        date: new Date(measurement.createdAt).toLocaleDateString("pl-PL"),
      },
    ];

    if (measurement.manualItems && measurement.manualItems.length > 0) {
      measurement.manualItems.forEach((manual) => {
        data.push({
          name: manual.name,
          left: manual.leftVolumeMl,
          right: manual.rightVolumeMl,
          date: new Date(manual.createdAt).toLocaleDateString("pl-PL"),
        });
      });
    }

    return data;
  };

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
              onClick={() => router.push("/mobile/panel/pomiary")}
              className="rounded-xl">
              Wróć do listy pomiarów
            </Button>
          </div>
        </div>
      </MobilePanelLayout>
    );
  }

  const { diff, percentage } = getVolumeDifference(
    measurement.leftVolumeMl,
    measurement.rightVolumeMl
  );

  const chartData = getChartData();

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
          <div className="flex items-center space-x-2">
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
          </div>
        </div>

        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{measurement.name}</CardTitle>
                {measurement.note && (
                  <p className="text-sm text-text-muted mt-1">
                    {measurement.note}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center text-sm text-text-muted">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDate(measurement.createdAt)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {measurement.leftVolumeMl.toFixed(1)}ml
                </div>
                <div className="text-sm text-text-muted">Lewa pierś</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {measurement.rightVolumeMl.toFixed(1)}ml
                </div>
                <div className="text-sm text-text-muted">Prawa pierś</div>
              </div>
            </div>

            <div className="bg-primary/10 rounded-xl p-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-primary mb-1">
                  Różnica objętości
                </div>
                <div className="text-2xl font-bold text-text-primary">
                  {diff.toFixed(1)}ml ({percentage}%)
                </div>
                <div className="text-sm text-text-muted">
                  {diff < 50 ? "Minimalna różnica" : "Wymaga uwagi"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {chartData.length > 1 && (
          <MeasurementChart
            data={chartData}
            title="Historia pomiarów"
            description="Porównanie pomiarów AI i ręcznych"
          />
        )}

        {measurement.manualItems && measurement.manualItems.length > 0 && (
          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Pomiary ręczne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {measurement.manualItems.map((manual) => (
                  <div
                    key={manual.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-medium text-text-primary">
                        {manual.name}
                      </div>
                      <div className="text-sm text-text-muted">
                        {formatDate(manual.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-text-primary">
                        {manual.leftVolumeMl.toFixed(1)}ml /{" "}
                        {manual.rightVolumeMl.toFixed(1)}ml
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
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
