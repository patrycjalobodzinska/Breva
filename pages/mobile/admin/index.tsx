import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Users,
  BarChart3,
  Settings,
  TrendingUp,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default function MobileAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/mobile/logowanie");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-text-muted">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-1 to-accent-2">
      <div className="flex flex-col h-screen">
        <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-primary/20 sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <Heart className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold text-text-primary">BREVA</span>
              <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                ADMIN
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Panel Administratora
              </h1>
              <p className="text-text-muted">
                Zarządzaj użytkownikami i pomiarami
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        Użytkownicy
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-text-primary mb-1">
                    24
                  </div>
                  <div className="text-xs text-text-muted">
                    Zarejestrowanych
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        Pomiary
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-text-primary mb-1">
                    156
                  </div>
                  <div className="text-xs text-text-muted">Łącznie</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Zarządzanie
              </h2>

              <Link href="/mobile/admin/uzytkownicy">
                <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-primary">
                          Użytkownicy
                        </h3>
                        <p className="text-sm text-text-muted">
                          Zarządzaj kontami użytkowników
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl">
                        Otwórz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/mobile/admin/pomiary">
                <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-primary">
                          Pomiary
                        </h3>
                        <p className="text-sm text-text-muted">
                          Przeglądaj wszystkie pomiary
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl">
                        Otwórz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Panel Administratora
                </h3>
                <p className="text-sm text-text-muted mb-4">
                  Masz pełny dostęp do zarządzania systemem BREVA
                </p>
                <Button variant="outline" size="sm" className="rounded-xl">
                  Zobacz statystyki
                </Button>
              </div>
            </div>
          </div>
        </main>

        <nav className="bg-white/90 backdrop-blur-sm border-t border-primary/20 sticky bottom-0 z-50">
          <div className="flex items-center justify-around py-2">
            <Link
              href="/mobile/admin"
              className="flex flex-col items-center py-2 px-3 rounded-xl text-primary">
              <Shield className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Admin</span>
            </Link>
            <Link
              href="/mobile/panel"
              className="flex flex-col items-center py-2 px-3 rounded-xl text-text-muted hover:text-primary">
              <BarChart3 className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Panel</span>
            </Link>
            <Link
              href="/mobile"
              className="flex flex-col items-center py-2 px-3 rounded-xl text-text-muted hover:text-primary">
              <Heart className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Strona</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
