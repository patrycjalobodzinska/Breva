"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Upload, BarChart3, Settings, User } from "lucide-react";
import { useEffect } from "react";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

const navigation = [
  { name: "Pomiary", href: "/mobile/panel/pomiary", icon: BarChart3 },
  { name: "Nowy pomiar", href: "/mobile/panel/przesylanie", icon: Upload },
  { name: "Ustawienia", href: "/mobile/panel/ustawienia", icon: Settings },
];

interface MobilePanelLayoutProps {
  children: React.ReactNode;
}

export default function MobilePanelLayout({
  children,
}: MobilePanelLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
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

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br max-h-screen from-accent-1 to-accent-2">
      <div className="flex flex-col h-screen">
        <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-primary/20 sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <Heart className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold text-text-primary">BREVA</span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-text-muted">
              <User className="h-4 w-4" />
              <span>
                {session?.user?.name || session?.user?.email || "Użytkownik"}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1  h-full overflow-y-auto ">
          <div className="p-4">{children}</div>
        </main>

        <nav className="bg-white/90 backdrop-blur-sm border-t border-primary/20 sticky bottom-0 z-50">
          <div className="flex items-center justify-around py-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-text-muted hover:text-primary"
                  }`}>
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <PWAInstallPrompt />
      </div>
    </div>
  );
}
