import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function MobileLoading() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Jeśli sesja jest załadowana i użytkownik jest zalogowany, przekieruj na panel
    if (status === "authenticated" && session) {
      const timer = setTimeout(() => {
        router.push("/mobile/panel");
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Logo/Icon */}
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-2xl">📱</span>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Logowanie...</h2>
            <p className="text-white/80 text-sm">
              Sprawdzamy Twoje dane logowania
            </p>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
          <div
            className="w-2 h-2 bg-white/60 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}></div>
          <div
            className="w-2 h-2 bg-white/60 rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
}
