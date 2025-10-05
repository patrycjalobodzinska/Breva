"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Upload, BarChart3, Settings, LogOut, User, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  { name: "Pomiary", href: "/panel/pomiary", icon: BarChart3 },
  { name: "Nowy pomiar", href: "/panel/przesylanie", icon: Upload },
  { name: "Ustawienia", href: "/panel/ustawienia", icon: Settings },
];

interface PanelLayoutProps {
  children: React.ReactNode;
}

export default function PanelLayout({ children }: PanelLayoutProps) {
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
    <div className="min-h-screen bg-gradient-to-br from-accent-1 to-accent-2">
      {/* Header */}
      <header className="bg-white/80 shadow-sm backdrop-blur-sm border-b border-primary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/panel" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-text-primary">
                BREVA
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-text-muted">
                <User className="h-4 w-4" />
                <span>
                  {session?.user?.name || session?.user?.email || "Użytkownik"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  signOut({ callbackUrl: "http://localhost:3000/" })
                }
                className="rounded-2xl">
                <LogOut className="h-4 w-4 mr-2" />
                Wyloguj
              </Button>
            </div>

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-2xl">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="text-left">Menu</SheetTitle>
                  </SheetHeader>
                  
                  {/* User Info */}
                  <div className="flex items-center space-x-2 text-sm text-text-muted py-4 border-b">
                    <User className="h-4 w-4" />
                    <span>
                      {session?.user?.name || session?.user?.email || "Użytkownik"}
                    </span>
                  </div>

                  {/* Navigation */}
                  <nav className="space-y-2 py-4">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-primary/10 transition-colors">
                          <Icon className="h-5 w-5 text-text-muted" />
                          <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Logout Button */}
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        signOut({ callbackUrl: "http://localhost:3000/" })
                      }
                      className="w-full rounded-2xl">
                      <LogOut className="h-4 w-4 mr-2" />
                      Wyloguj
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-64">
            <Card className="rounded-2xl p-4 bg-white">
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-primary/10 transition-colors">
                      <Icon className="h-5 w-5 text-text-muted" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
