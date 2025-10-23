"use client";

import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, Sparkles, Download } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const Scene3D = dynamic(
  () =>
    import("@/components/3d/Scene3D").then((mod) => ({ default: mod.Scene3D })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-1 to-accent-2 rounded-3xl">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-full mx-auto mb-3 animate-pulse"></div>
          <p className="text-text-muted text-sm">Ładowanie modelu 3D...</p>
        </div>
      </div>
    ),
  }
);

export const MobileHeroSection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-1 to-accent-2 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-text-primary leading-tight mb-4">
              Analiza piersi
              <span className="block text-primary">z pomocą AI</span>
            </h1>
            <p className="text-lg text-text-muted leading-relaxed mb-8">
              Zaawansowana technologia sztucznej inteligencji do precyzyjnej
              analizy objętości piersi
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <Link href="/rejestracja">
              <Button
                size="lg"
                className="w-full rounded-2xl bg-primary hover:bg-primary-dark text-white py-4 text-lg font-semibold">
                Rozpocznij analizę
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/logowanie">
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-2xl border-primary text-primary hover:bg-primary/10 py-4 text-lg">
                Zaloguj się
              </Button>
            </Link>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">99.2%</div>
              <div className="text-sm text-text-muted">Dokładności AI</div>
            </div>
          </div>
        </div>

        <div className="h-64 mb-6 mx-6">
          <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl">
            <Scene3D className="w-full h-full" wireframeParts="upper" />
          </div>
        </div>

        <div className="px-6 pb-8">
          <div className="flex items-center justify-center space-x-6 text-center">
            <div className="flex-1">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="text-sm font-medium text-text-primary">AI</div>
              <div className="text-xs text-text-muted">Analiza</div>
            </div>
            <div className="flex-1">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div className="text-sm font-medium text-text-primary">
                Bezpieczeństwo
              </div>
              <div className="text-xs text-text-muted">Dane</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
