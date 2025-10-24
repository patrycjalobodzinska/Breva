"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  Activity,
  TrendingUp,
  RefreshCw,
  Brain,
  Hand,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";

interface DashboardStatsProps {
  className?: string;
}

export const DashboardStats = ({ className }: DashboardStatsProps) => {
  const { stats, isLoading, isRefreshing, error, refetch } = useDashboardStats();

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">Dashboard</h2>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card
              key={i}
              className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">Dashboard</h2>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            Odśwież
          </Button>
        </div>
        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <p className="text-text-muted">
              {error || "Nie udało się załadować statystyk"}
            </p>
            <Button onClick={handleRefresh} className="mt-4">
              Spróbuj ponownie
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Dashboard</h2>
          <p className="text-text-muted text-sm">
            Statystyki z ostatnich 7 dni (
            {new Date(stats.period.startDate).toLocaleDateString("pl-PL")} -{" "}
            {new Date(stats.period.endDate).toLocaleDateString("pl-PL")})
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isRefreshing}>
          {isRefreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Odśwież
        </Button>
      </div>

      {/* Główne statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>Wszystkie pomiary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              {stats.measurements.total}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                +{stats.measurements.last7Days} ostatnie 7 dni
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Brain className="h-4 w-4 text-blue-600" />
              <span>Pomiary AI</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              {stats.measurements.ai.total}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                +{stats.measurements.ai.last7Days} ostatnie 7 dni
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Hand className="h-4 w-4 text-green-600" />
              <span>Pomiary ręczne</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              {stats.measurements.manual.total}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                +{stats.measurements.manual.last7Days} ostatnie 7 dni
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-purple-600" />
              <span>Użytkownicy</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              {stats.users.total}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                +{stats.users.last7Days} ostatnie 7 dni
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Średnie objętości */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Activity className="h-4 w-4 text-primary" />
              <span>Średnia objętość (ostatnie 7 dni)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-text-muted text-sm">Lewa pierś</p>
                <p className="text-xl font-semibold text-text-primary">
                  {stats.averageVolume.left} ml
                </p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Prawa pierś</p>
                <p className="text-xl font-semibold text-text-primary">
                  {stats.averageVolume.right} ml
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Aktywność dzienna</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.dailyStats.length > 0 ? (
                stats.dailyStats.map((day, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">
                      {new Date(day.date).toLocaleDateString("pl-PL", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {day.count} pomiarów
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-text-muted text-sm">
                  Brak danych z ostatnich 7 dni
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
