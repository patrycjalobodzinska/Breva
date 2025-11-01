import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { MobileHeroSection } from "@/components/sections/MobileHeroSection";

export default function MobileHome() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Jeśli użytkownik jest zalogowany, przekieruj na odpowiedni panel
    if (status === "authenticated" && session) {
      if (session.user?.role === "ADMIN") {
        router.push("/mobile/admin");
      } else {
        router.push("/mobile/panel");
      }
    }
  }, [session, status, router]);

  // Jeśli sesja się ładuje, nie pokazuj loadera - przekierowanie jest szybkie
  if (status === "loading") {
    return null;
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
