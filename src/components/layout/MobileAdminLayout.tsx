"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { BarChart3, Users, Shield, Settings, User } from "lucide-react";
import { useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/mobile/admin", icon: Shield },
  { name: "Użytkownicy", href: "/mobile/admin/uzytkownicy", icon: Users },
  { name: "Pomiary", href: "/mobile/admin/pomiary", icon: BarChart3 },
  { name: "Ustawienia", href: "/mobile/admin/ustawienia", icon: Settings },
];

interface MobileAdminLayoutProps {
  children: React.ReactNode;
}

export default function MobileAdminLayout({
  children,
}: MobileAdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/mobile");
    }
  }, [session, status, router]);

  // Don't show loader in layout - let child components handle their own loading states
  if (status === "loading" || !session || session.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="max-h-screen bg-gradient-to-br from-accent-1 to-accent-2 overflow-x-hidden">
      <div className="flex flex-col h-screen overflow-x-hidden">
        <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-primary/20 sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 py-3 pt-16">
            <div className="flex items-center space-x-3">
              <Image
                src="/logo.png"
                alt="BREVA Logo"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
            </div>
            <Link href="/mobile/admin" className="flex items-center space-x-3">
              <User className="h-6 w-6 text-primary" />
            </Link>
          </div>
        </header>

        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden">
          <div className="p-4 w-full max-w-full">{children}</div>
        </main>

        <nav className="bg-white/90 backdrop-blur-sm border-t border-primary/20 sticky bottom-0 z-50">
          <div className="flex items-center justify-around py-2 pb-6">
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
      </div>
    </div>
  );
}
