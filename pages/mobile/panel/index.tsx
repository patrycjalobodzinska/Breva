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
import Link from "next/link";

export default function MobilePanelDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/logowanie");
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
                  12
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
                      Ostatnie 30 dni
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-text-primary mb-1">
                  +3
                </div>
                <div className="text-xs text-text-muted">Nowe pomiary</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {/* <h2 className="text-lg font-semibold text-text-primary">
              Szybkie akcje
            </h2> */}

            {/* <Link href="/mobile/panel/przesylanie">
              <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary">
                        Nowy pomiar
                      </h3>
                      <p className="text-sm text-text-muted">
                        Dodaj nową analizę
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      Rozpocznij
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/mobile/panel/pomiary">
              <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary">
                        Historia pomiarów
                      </h3>
                      <p className="text-sm text-text-muted">
                        Zobacz wszystkie analizy
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      Otwórz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/mobile/panel/ustawienia">
              <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary">
                        Ustawienia
                      </h3>
                      <p className="text-sm text-text-muted">
                        Zarządzaj kontem
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      Otwórz
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link> */}
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
