import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield } from "lucide-react";
import Link from "next/link";
import { Loader } from "@/components/ui/loader";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/logowanie");
    }
  }, [session, status, router]);

  // Layout handles session loading
  if (status === "loading" || !session || session.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Panel Administratora
          </h1>
          <p className="text-text-muted">Zarządzaj systemem BREVA</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/90  rounded-2xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Użytkownicy</h3>
              <p className="text-text-muted mb-4">
                Zarządzaj użytkownikami systemu
              </p>
              <Link
                href="/admin/uzytkownicy"
                className="text-primary hover:underline">
                Otwórz →
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-white/90">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Pomiary</h3>
              <p className="text-text-muted mb-4">
                Przeglądaj wszystkie pomiary
              </p>
              <Link
                href="/admin/pomiary"
                className="text-primary hover:underline">
                Otwórz →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
