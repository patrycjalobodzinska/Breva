import MobileAdminLayout from "@/components/layout/MobileAdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Users, BarChart3, Shield, TrendingUp, Activity } from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";

export default function MobileAdminPage() {
  const { data: stats, isLoading } = useAdminStats();

  return (
    <MobileAdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Panel Administratora
          </h1>
          <p className="text-text-muted text-sm">Zarządzaj systemem BREVA</p>
        </div>

        {/* Quick Stats */}
        {isLoading ? (
          <Loader
            message="Ładowanie statystyk..."
            variant="spinner"
            size="md"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.users.total || 0}
                </p>
                <p className="text-xs text-text-muted">
                  Użytkownicy
                  {stats?.users.last7Days ? (
                    <span className="text-green-600 ml-1">
                      +{stats.users.last7Days} (7d)
                    </span>
                  ) : null}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-text-primary">
                  {stats?.measurements.total || 0}
                </p>
                <p className="text-xs text-text-muted">
                  Pomiary
                  {stats?.measurements.last7Days ? (
                    <span className="text-blue-600 ml-1">
                      +{stats.measurements.last7Days} (7d)
                    </span>
                  ) : null}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-text-primary">
            Zarządzanie
          </h2>

          <Link href="/mobile/admin/uzytkownicy">
            <Card className="rounded-2xl bg-white/90 mb-3 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">
                      Użytkownicy
                    </h3>
                    <p className="text-sm text-text-muted">
                      Zarządzaj użytkownikami systemu
                    </p>
                  </div>
                  <Shield className="h-5 w-5 text-text-muted" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/mobile/admin/pomiary">
            <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">Pomiary</h3>
                    <p className="text-sm text-text-muted">
                      Przeglądaj wszystkie pomiary
                    </p>
                  </div>
                  <Shield className="h-5 w-5 text-text-muted" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </MobileAdminLayout>
  );
}
