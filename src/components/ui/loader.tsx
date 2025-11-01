import { Heart, Loader2 } from "lucide-react";

interface LoaderProps {
  message?: string;
  variant?: "default" | "heart" | "spinner";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loader({
  message = "Ładowanie...",
  variant = "spinner",
  size = "md",
  className = "",
}: LoaderProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const iconSize = sizeClasses[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        {variant === "heart" ? (
          <Heart
            className={`${iconSize} text-primary mx-auto mb-4 animate-pulse`}
          />
        ) : variant === "spinner" ? (
          <Loader2
            className={`${iconSize} text-primary mx-auto mb-4 animate-spin`}
          />
        ) : (
          <div
            className={`${iconSize} border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4`}
          />
        )}
        {message && <p className="text-text-muted">{message}</p>}
      </div>
    </div>
  );
}

interface PageLoaderProps {
  message?: string;
  variant?: "default" | "heart" | "spinner";
  fullHeight?: boolean;
}

export function PageLoader({
  message = "Ładowanie...",
  variant = "spinner",
  fullHeight = false,
}: PageLoaderProps) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullHeight ? "min-h-screen" : "h-64"
      }`}>
      <Loader message={message} variant={variant} size="lg" />
    </div>
  );
}
