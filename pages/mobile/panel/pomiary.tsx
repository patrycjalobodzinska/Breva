import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import MobilePanelLayout from "@/components/layout/MobilePanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Calendar, TrendingUp, Filter } from "lucide-react";
import { toast } from "sonner";

interface Measurement {
  id: string;
  name: string;
  note?: string;
  source: "AI" | "MANUAL";
  leftVolumeMl: number;
  rightVolumeMl: number;
  createdAt: string;
  manualItems?: {
    id: string;
    name: string;
    leftVolumeMl: number;
    rightVolumeMl: number;
    createdAt: string;
  }[];
}

export default function MobileMeasurementsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchMeasurements = async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/measurements?page=${page}&pageSize=10`
      );
      if (response.ok) {
        const data = await response.json();
        setMeasurements(data.measurements);
        setPagination(data.pagination);
        setCurrentPage(page);
      } else {
        toast.error("Nie udało się pobrać pomiarów");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas pobierania pomiarów");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const filteredMeasurements = measurements.filter(
    (measurement) =>
      measurement.source !== "MANUAL" &&
      (measurement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        measurement.note?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getVolumeDifference = (left: number, right: number) => {
    const diff = Math.abs(left - right);
    const percentage = ((diff / Math.max(left, right)) * 100).toFixed(1);
    return { diff, percentage };
  };

  return (
    <MobilePanelLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Pomiary</h1>
          <Button
            onClick={() => router.push("/mobile/panel/przesylanie")}
            size="sm"
            className="rounded-xl">
            Nowy pomiar
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Szukaj pomiarów..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-muted">Ładowanie pomiarów...</p>
            </div>
          </div>
        ) : filteredMeasurements.length === 0 ? (
          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Brak pomiarów
              </h3>
              <p className="text-text-muted mb-4">
                {searchTerm
                  ? "Nie znaleziono pomiarów pasujących do wyszukiwania"
                  : "Nie masz jeszcze żadnych pomiarów"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMeasurements.map((measurement) => {
              const { diff, percentage } = getVolumeDifference(
                measurement.leftVolumeMl,
                measurement.rightVolumeMl
              );

              return (
                <Card
                  key={measurement.id}
                  className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow"
                  onClick={() =>
                    router.push(`/mobile/panel/pomiary/${measurement.id}`)
                  }>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-primary mb-1">
                          {measurement.name}
                        </h3>
                        {measurement.note && (
                          <p className="text-sm text-text-muted mb-2">
                            {measurement.note}
                          </p>
                        )}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-xs text-text-muted">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(measurement.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-text-primary">
                          {measurement.leftVolumeMl.toFixed(1)}ml
                        </div>
                        <div className="text-xs text-text-muted">
                          Lewa pierś
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-text-primary">
                          {measurement.rightVolumeMl.toFixed(1)}ml
                        </div>
                        <div className="text-xs text-text-muted">
                          Prawa pierś
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <span className="text-text-muted">Różnica:</span>
                        <span className="font-medium text-text-primary">
                          {diff.toFixed(1)}ml ({percentage}%)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMeasurements(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="rounded-xl">
              Poprzednia
            </Button>
            <span className="text-sm text-text-muted">
              {pagination.page} z {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMeasurements(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="rounded-xl">
              Następna
            </Button>
          </div>
        )}
      </div>
    </MobilePanelLayout>
  );
}
