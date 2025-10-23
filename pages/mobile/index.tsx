import { useEffect } from "react";
import { useRouter } from "next/router";

export default function MobileHome() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new unified mobile app
    router.replace("/mobile/app");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-primary rounded-full mx-auto mb-3 animate-pulse"></div>
        <p className="text-text-muted">Przekierowywanie...</p>
      </div>
    </div>
  );
}