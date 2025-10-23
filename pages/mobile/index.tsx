import Link from "next/link";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ArrowRight,
  Sparkles,
  Shield,
  Users,
  Zap,
  Download,
} from "lucide-react";
import { MobileHeroSection } from "@/components/sections/MobileHeroSection";

export default function MobileHome() {
  return (
    <div className="min-h-screen  bg-gradient-to-br from-accent-1 to-accent-2">
      <div className=" bg-gradient-to-br h-full from-accent-1 to-accent-2">
        <MobileHeroSection />
      </div>
    </div>
  );
}
