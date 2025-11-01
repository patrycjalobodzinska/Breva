"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { useEffect } from "react";

const navigation = [
  { name: "Użytkownicy", href: "/admin/uzytkownicy", icon: Users },
  { name: "Pomiary", href: "/admin/pomiary", icon: BarChart3 },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/logowanie");
    }
  }, [session, status, router]);

  // Don't show loader in layout - let child components handle their own loading states
  if (status === "loading" || !session || session.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-main/10 to-accent-2">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-primary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-text-primary">
                BREVA
              </span>
              <Badge variant="destructive" className="ml-2">
                Admin
              </Badge>
            </Link>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-text-muted">
                <Shield className="h-4 w-4" />
                <span>{session.user?.name || session.user?.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  signOut({
                    callbackUrl:
                      process.env.NEXTAUTH_URL || "http://localhost:3000",
                  })
                }
                className="rounded-2xl">
                <LogOut className="h-4 w-4 mr-2" />
                Wyloguj
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64">
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
