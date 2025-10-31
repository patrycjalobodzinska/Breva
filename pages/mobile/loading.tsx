import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";

export default function MobileLoading() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Jeśli sesja jest załadowana i użytkownik jest zalogowany, przekieruj na odpowiedni panel
    if (status === "authenticated" && session) {
      const timer = setTimeout(() => {
        if (session.user?.role === "ADMIN") {
          router.push("/mobile/admin");
        } else {
          router.push("/mobile/panel");
        }
      }, 2000); // 2 sekundy ładowania dla lepszego UX

      return () => clearTimeout(timer);
    }

    // Jeśli sesja nie jest załadowana, ale nie ma błędu, czekaj
    if (status === "loading") {
      return;
    }

    // Jeśli nie ma sesji, przekieruj na stronę główną
    if (status === "unauthenticated") {
      router.push("/mobile");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="text-center">
        <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
        <p className="text-text-muted">Ładowanie...</p>
      </div>
    </div>
  );
}
