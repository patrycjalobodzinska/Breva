import PanelLayout from "@/components/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStats } from "@/hooks/useUserStats";
import { WebViewBridge } from "@/components/WebViewBridge";
import { BarChart3, TrendingUp, Brain, Hand, Activity } from "lucide-react";

export default function PanelPage() {
  const { stats, isLoading } = useUserStats();

  if (isLoading) {
    return (
      <PanelLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-muted">Ładowanie statystyk...</p>
          </div>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Panel Użytkownika
          </h1>
          <p className="text-text-muted">
            Przeglądaj swoje pomiary i statystyki
          </p>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-2xl shadow-lg bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Wszystkie pomiary
                  </CardTitle>
                  <p className="text-xs text-text-muted">Łączna liczba</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-text-primary">
                {stats?.measurements?.total || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Ostatnie 7 dni
                  </CardTitle>
                  <p className="text-xs text-text-muted">Nowe pomiary</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-text-primary">
                +{stats?.measurements?.last7Days || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Średnie objętości */}
        {stats?.averageVolume &&
          (stats.averageVolume.left > 0 || stats.averageVolume.right > 0) && (
            <Card className="rounded-2xl shadow-lg bg-white">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Średnia objętość (ostatnie 7 dni)
                    </CardTitle>
                    <p className="text-sm text-text-muted">
                      Średnie wartości z Twoich pomiarów
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-text-primary mb-1">
                      {stats.averageVolume.left} ml
                    </div>
                    <div className="text-sm text-text-muted">Lewa pierś</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-text-primary mb-1">
                      {stats.averageVolume.right} ml
                    </div>
                    <div className="text-sm text-text-muted">Prawa pierś</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Skan LiDAR */}
        <WebViewBridge 
          onLiDARData={(data) => {
            console.log('Otrzymano dane LiDAR:', data);
            // Tutaj możesz przetworzyć dane LiDAR
          }} 
        />

        {/* Szybkie akcje */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-2xl shadow-lg bg-white hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-primary-dark">
                📁 Przesyłanie plików
              </CardTitle>
            </CardHeader>
            <CardContent className="text-text-muted">
              Prześlij zdjęcia, filmy lub pliki LiDAR do analizy.
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl shadow-lg bg-white hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-primary-dark">
                📊 Moje pomiary
              </CardTitle>
            </CardHeader>
            <CardContent className="text-text-muted">
              Przeglądaj historię swoich pomiarów i analiz.
            </CardContent>
          </Card>
        </div>
      </div>
    </PanelLayout>
  );
}
