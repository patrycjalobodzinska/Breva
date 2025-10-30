import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import MobilePanelLayout from "@/components/layout/MobilePanelLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Upload,
  BarChart3,
  Settings,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";

export default function MobilePanelDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: stats } = useUserStats();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/mobile");
    }
    // Jeśli admin wejdzie na panel użytkownika, przekieruj na panel admina
    if (session?.user?.role === "ADMIN") {
      router.push("/mobile/admin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <MobilePanelLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-text-muted">Ładowanie...</p>
          </div>
        </div>
      </MobilePanelLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Panel użytkownika - BREVA</title>
        <meta
          name="description"
          content="Zarządzaj swoimi pomiarami piersi w panelu BREVA"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>
      <MobilePanelLayout>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Witaj, {session?.user?.name || "Użytkowniku"}!
            </h1>
            <p className="text-text-muted">
              Zarządzaj swoimi pomiarami i analizami
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                    <CardDescription className="text-xs">
                      Twoje analizy
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-text-primary mb-1">
                  {stats?.measurements?.total || 0}
                </div>
                <div className="text-xs text-text-muted">Łącznie pomiarów</div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      Postęp
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Ostatnie 7 dni
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-text-primary mb-1">
                  +{stats?.measurements?.last7Days || 0}
                </div>
                <div className="text-xs text-text-muted">Ostatnie 7 dni</div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Potrzebujesz pomocy?
              </h3>
              <p className="text-sm text-text-muted mb-4">
                Sprawdź nasze wskazówki dotyczące robienia zdjęć dla najlepszych
                wyników
              </p>
              <Button variant="outline" size="sm" className="rounded-xl">
                Zobacz wskazówki
              </Button>
            </div>
          </div>
        </div>
      </MobilePanelLayout>
    </>
  );
}
