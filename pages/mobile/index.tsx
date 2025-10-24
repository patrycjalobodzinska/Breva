import { MobileHeroSection } from "@/components/sections/MobileHeroSection";
import { LiDARScanButton } from "@/components/LiDARScanButton";

export default function MobileHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-1 to-accent-2">
      <div className="bg-gradient-to-br h-full from-accent-1 to-accent-2">
        <MobileHeroSection />
        
        {/* LiDAR Scan Button */}
        <div className="px-6 pb-8">
          <LiDARScanButton 
            onScanComplete={(data) => {
              console.log("LiDAR scan completed:", data);
              // Można dodać przekierowanie do panelu
            }}
            onScanError={(error) => {
              console.error("LiDAR scan error:", error);
            }}
            className="max-w-md mx-auto"
          />
        </div>
      </div>
    </div>
  );
}
