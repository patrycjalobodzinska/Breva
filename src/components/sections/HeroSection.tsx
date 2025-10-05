"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const Scene3D = dynamic(
  () =>
    import("@/components/3d/Scene3D").then((mod) => ({ default: mod.Scene3D })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-1 to-accent-2 rounded-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-text-muted">Ładowanie modelu 3D...</p>
        </div>
      </div>
    ),
  }
);

export const HeroSection = () => {
  return (
    <section className="relative  md:min-h-[60vh] overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="absolute top-0 md:scale-110 scale-100 xl:left-16  w-full h-[80vh]  md:h-screen z-0 overflow-hidden">
        <Scene3D className="w-full h-full" wireframeParts="upper" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-text-primary leading-tight">
                Analiza piersi
                <span className="block text-primary">z pomocą AI</span>
              </h1>
              <p className="text-xl text-text-muted leading-relaxed">
                Zaawansowana technologia sztucznej inteligencji do precyzyjnej
                analizy objętości piersi
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/rejestracja">
                <Button
                  size="lg"
                  className="rounded-2xl bg-primary hover:bg-primary-dark text-white px-8 py-4 text-lg">
                  Rozpocznij analizę
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/logowanie">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-2xl border-primary text-primary hover:bg-primary/10 px-8 py-4 text-lg">
                  Zaloguj się
                </Button>
              </Link>
            </div>
          </div>

          <div className="absolute -bottom-15 -right-15 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg z-20">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">99.2%</div>
              <div className="text-xs text-text-muted">Dokładności</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
