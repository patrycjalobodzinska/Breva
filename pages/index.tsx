import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Upload, BarChart3, Shield, Users, Zap } from "lucide-react";
import { HeroSection } from "@/components/sections/HeroSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-1 to-accent-2">
      {/* Header */}
      <header className="w-full z-20 sticky top-0  bg-white/80 backdrop-blur-sm shadow-sm px-4 py-2">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="BREVA Logo"
              width={100}
              height={100}
              className="h-16 w-16 object-contain"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/logowanie">
              <Button variant="outline" className="rounded-2xl">
                Zaloguj się
              </Button>
            </Link>

            <Link href="/rejestracja">
              <Button variant={"default"}>Rozpocznij</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section with 3D Model */}
      <HeroSection />

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-text-primary mb-4">
            Dlaczego BREVA?
          </h2>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">
            Najnowocześniejsza technologia do precyzyjnej analizy asymetrii
            piersi
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Technologia LiDAR</CardTitle>
              <CardDescription>
                Zaawansowane skanowanie 3D z wykorzystaniem czujnika LiDAR w
                urządzeniach iOS
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Szybka analiza AI</CardTitle>
              <CardDescription>
                Zaawansowane algorytmy uczenia maszynowego dla precyzyjnych
                wyników
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Szczegółowe raporty</CardTitle>
              <CardDescription>
                Kompleksowe analizy z wykresami i porównaniami manualnymi
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Jak to działa?
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Prosty proces w trzech krokach
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Skanowanie LiDAR</h3>
              <p className="text-text-muted">
                Wykonaj precyzyjny skan 3D za pomocą technologii LiDAR w
                aplikacji iOS
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Analiza AI</h3>
              <p className="text-text-muted">
                Nasze algorytmy analizują objętość
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Otrzymaj wyniki</h3>
              <p className="text-text-muted">Precyzyjne pomiary</p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}

      {/* FAQ Section */}
      <section className=" py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Najczęściej zadawane pytania
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  Jakie urządzenia są obsługiwane?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-muted">
                  Aplikacja wymaga urządzenia iOS z czujnikiem LiDAR (iPhone 12
                  Pro i nowsze, iPad Pro z LiDAR).
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  Jak dokładne są pomiary AI?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-muted">
                  Nasze algorytmy osiągają dokładność powyżej 95% w porównaniu z
                  pomiarami manualnymi.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  Czy moje dane są bezpieczne?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-muted">
                  Tak, dane skanów LiDAR są analizowane przez AI i następnie
                  automatycznie usuwane. Przechowujemy wyłącznie wyniki
                  pomiarów.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="BREVA Logo"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            </div>
            <p className="text-sm opacity-80">
              © {new Date().getFullYear()} BREVA. Wszystkie prawa zastrzeżone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
