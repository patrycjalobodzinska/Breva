"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRight, Sparkles, Download } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MobileLoginForm } from "@/components/mobile/MobileLoginForm";
import { MobileRegisterForm } from "@/components/mobile/MobileRegisterForm";

const Scene3D = dynamic(
  () =>
    import("@/components/3d/Scene3DMobile").then((mod) => ({
      default: mod.Scene3DMobile,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-1 to-accent-2 rounded-3xl">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-full mx-auto mb-3 animate-pulse"></div>
          <p className="text-text-muted text-sm"></p>
        </div>
      </div>
    ),
  }
);

type View = "home" | "login" | "register";

export const MobileHeroSection = () => {
  const [currentView, setCurrentView] = useState<View>("home");

  const handleSwitchToLogin = () => setCurrentView("login");
  const handleSwitchToRegister = () => setCurrentView("register");

  return (
    <div className="min-h-screen  bg-gradient-to-br h-full from-accent-1 to-accent-2 relative overflow-hidden">
      <div className="relative  h-screen gap-6 z-10 flex flex-col ">
        <div className=" absolute    top-0 left-0 h-screen w-screen">
          <div className="bg-accent-2 z-0    h-[45%] "></div>
          <div className="gradient-to-b z-0  h-[15%] bg-gradient-to-t from-transparent to-accent-2  w-full "></div>
        </div>
        <div className="absolute -z-10 opacity-70 bottom-0 left-0 w-full flex  items-end h-screen">
          <div className="w-full -z-10  h-full rounded-3xl overflow-hidden shadow-2xl">
            <Scene3D className="w-full h-full" wireframeParts="upper" />
          </div>
        </div>
        {currentView === "login" && (
          <MobileLoginForm onSwitchToRegister={handleSwitchToRegister} />
        )}
        {currentView === "register" && (
          <MobileRegisterForm onSwitchToLogin={handleSwitchToLogin} />
        )}
        {currentView === "home" && (
          <>
            <div className="flex z-10 flex-col ">
              <div className="text-center mt-10">
                <div className="flex mt-6 items-center justify-center mb-1">
                  <Image
                    src="/logo.png"
                    alt="BREVA"
                    width={80}
                    height={80}
                    className="h-20 w-20 object-contain"
                  />
                </div>
                <h1 className="text-4xl font-bold text-text-primary  mb-4 w-full text-center">
                  Witaj w<span className=" text-primary"> Breva!</span>
                </h1>
                <div className="text-text-muted leading-relaxed text-center text-base px-8">
                  Zaawansowana technologia sztucznej inteligencji do precyzyjnej
                  analizy objętości piersi
                </div>
              </div>
            </div>
            <div className="space-y-4 z-10 mb-8 mx-6">
              <Button
                onClick={handleSwitchToRegister}
                className="w-full px-4 flex items-center justify-center rounded-2xl bg-primary hover:bg-primary-dark text-white py-2 text-lg font-semibold">
                Rozpocznij analizę
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                onClick={handleSwitchToLogin}
                variant="outline"
                className="w-full px-4 flex items-center justify-center rounded-2xl border-primary text-primary hover:bg-primary/10 py-2 text-lg">
                Zaloguj się
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
