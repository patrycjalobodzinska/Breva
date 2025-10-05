import Link from "next/link";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ArrowRight,
  Sparkles,
  Shield,
  Users,
  Zap,
  Download,
} from "lucide-react";
import { MobileHeroSection } from "@/components/sections/MobileHeroSection";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import {
  PWAInstallButton,
  PWAStatusIndicator,
} from "@/components/PWAInstallButton";

export default function MobileHome() {
  return (
    <>
      <Head>
        <title>BREVA - Analiza piersi z pomocą AI</title>
        <meta
          name="description"
          content="Precyzyjna analiza objętości piersi z pomocą sztucznej inteligencji. Zaawansowana technologia do pomiaru asymetrii piersi."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-accent-1 to-accent-2">
        <MobileHeroSection />

        <section className="px-6 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Dlaczego BREVA?
            </h2>
            <p className="text-lg text-text-muted max-w-md mx-auto">
              Najnowocześniejsza technologia do precyzyjnej analizy asymetrii
              piersi
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary">
                    Precyzyjna Analiza AI
                  </h3>
                  <p className="text-text-muted">
                    Wykorzystujemy zaawansowane algorytmy AI do dokładnego
                    pomiaru objętości.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary">
                    Bezpieczeństwo Danych
                  </h3>
                  <p className="text-text-muted">
                    Twoje dane są szyfrowane i chronione zgodnie z najwyższymi
                    standardami.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary">
                    Dostępność PWA
                  </h3>
                  <p className="text-text-muted">
                    Korzystaj z aplikacji jak z natywnej, instalując ją na swoim
                    urządzeniu mobilnym.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <PWAInstallButton
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12 bg-white/80 backdrop-blur-sm">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-text-primary mb-3">
              Jak to działa?
            </h2>
            <p className="text-lg text-text-muted max-w-md mx-auto">
              Proste kroki do precyzyjnej analizy
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-1">
                  Prześlij zdjęcie
                </h3>
                <p className="text-text-muted">
                  Zrób zdjęcie zgodnie z instrukcjami i prześlij je do analizy.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-1">
                  Analiza AI
                </h3>
                <p className="text-text-muted">
                  Nasza sztuczna inteligencja przetworzy zdjęcie i obliczy
                  objętość.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-1">
                  Otrzymaj wyniki
                </h3>
                <p className="text-text-muted">
                  Zobacz szczegółowe wyniki i śledź postępy w panelu.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-text-primary mb-3">
              Gotowy na rozpoczęcie?
            </h2>
            <p className="text-lg text-text-muted max-w-md mx-auto">
              Dołącz do tysięcy użytkowników, którzy już korzystają z BREVA
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/mobile/rejestracja">
              <Button
                size="lg"
                className="w-full rounded-2xl bg-primary hover:bg-primary-dark text-white py-4 text-lg font-semibold">
                Rozpocznij analizę
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <PWAInstallButton
              variant="outline"
              size="lg"
              className="w-full rounded-2xl border-primary text-primary hover:bg-primary/10 py-4 text-lg"
            />

            <Link href="/mobile/logowanie">
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-2xl border-primary text-primary hover:bg-primary/10 py-4 text-lg">
                Zaloguj się
              </Button>
            </Link>
          </div>
        </section>

        <footer className="bg-white/80 backdrop-blur-sm border-t border-primary/20 px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold text-text-primary">BREVA</span>
            </div>

            <PWAStatusIndicator />
            <div className="text-sm text-text-muted mb-4">
              <p>Precyzyjna analiza piersi z pomocą AI</p>
              <p className="mt-1">
                Zaawansowana technologia do pomiaru asymetrii piersi
              </p>
            </div>
            <div className="flex justify-center space-x-6 text-sm text-text-muted">
              <Link href="/mobile" className="hover:text-primary">
                Strona główna
              </Link>
              <Link href="/mobile/logowanie" className="hover:text-primary">
                Logowanie
              </Link>
              <Link href="/mobile/rejestracja" className="hover:text-primary">
                Rejestracja
              </Link>
            </div>
            <div className="mt-4 pt-4 border-t border-primary/20">
              <div className="flex justify-center space-x-6 text-sm text-text-muted">
                <span>Polityka prywatności</span>
                <span>Regulamin</span>
                <span>Kontakt</span>
              </div>
              <p className="text-sm text-text-muted">
                © 2024 BREVA. Wszystkie prawa zastrzeżone.
              </p>
            </div>
          </div>
        </footer>

        <PWAInstallPrompt />
      </div>
    </>
  );
}
