import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { MobileHeroSection } from "@/components/sections/MobileHeroSection";

export default function MobileHome() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Jeśli użytkownik jest zalogowany, przekieruj na panel
    if (status === "authenticated" && session) {
      router.push("/mobile/panel");
    }
  }, [session, status, router]);

  // Jeśli sesja się ładuje, pokaż loader
  if (status === "loading") {
    return (
      <div className="max-h-screen bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          <p className="text-white/80 text-sm">Sprawdzanie sesji...</p>
        </div>
      </div>
    );
  }

  // Jeśli użytkownik nie jest zalogowany, pokaż stronę główną
  return (
    <div className="max-h-screen bg-gradient-to-br from-accent-1 to-accent-2">
      <div className="bg-gradient-to-br h-full from-accent-1 to-accent-2">
        <MobileHeroSection />
      </div>
    </div>
  );
}
