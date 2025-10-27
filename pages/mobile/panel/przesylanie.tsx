import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import MobilePanelLayout from "@/components/layout/MobilePanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, ButtonUpload } from "@/components/ui/button";

import { AlertCircle, CheckCircle, Camera, Upload } from "lucide-react";
import { toast } from "sonner";

// Deklaracja typu dla komunikacji z aplikacją mobilną
declare global {
  interface Window {
    brevaNativeMessage?: (message: string) => void;
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export default function MobileUploadPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lidarData, setLidarData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    note: "",
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Plik jest za duży. Maksymalny rozmiar to 10MB");
        return;
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Nieobsługiwany format pliku. Użyj JPG lub PNG");
        return;
      }

      setSelectedFile(file);
      if (!formData.name) {
        setFormData((prev) => ({
          ...prev,
          name: file.name.replace(/\.[^/.]+$/, ""),
        }));
      }
    }
  };

  const handleLiDARCapture = () => {
    // Deep link do natywnej aplikacji Swift
    const deepLink = "breva://capture-lidar";

    // Debug - sprawdź co jest dostępne
    console.log("🔍 Debug aplikacji mobilnej:");
    console.log("- window.brevaNativeMessage:", !!window.brevaNativeMessage);
    console.log("- window.ReactNativeWebView:", !!window.ReactNativeWebView);
    console.log("- navigator.userAgent:", navigator.userAgent);
    console.log("- window.location.protocol:", window.location.protocol);
    console.log("- document.referrer:", document.referrer);

    // Sprawdź czy jesteśmy w aplikacji mobilnej (różne sposoby wykrywania)
    const isInMobileApp =
      window.brevaNativeMessage ||
      window.ReactNativeWebView ||
      navigator.userAgent.includes("BrevaApp") ||
      window.location.protocol === "file:" ||
      document.referrer.includes("breva://");

    console.log("📱 Czy w aplikacji mobilnej:", isInMobileApp);

    if (isInMobileApp) {
      // Jeśli jesteśmy w WebView, wyślij wiadomość do natywnej aplikacji
      if (window.brevaNativeMessage) {
        console.log("📤 Wysyłam przez brevaNativeMessage");
        window.brevaNativeMessage("capture-lidar");
      } else if (window.ReactNativeWebView) {
        console.log("📤 Wysyłam przez ReactNativeWebView");
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "capture-lidar",
          })
        );
      } else {
        console.log("📤 Używam deep link jako fallback");
        // Fallback - użyj deep link
        window.location.href = deepLink;
      }
    } else {
      console.log("🌐 Nie w aplikacji mobilnej - używam deep link");
      // Jeśli nie, spróbuj otworzyć deep link
      window.location.href = deepLink;

      // Fallback - pokaż informację o aplikacji mobilnej
      setTimeout(() => {
        toast.info(
          "Otwórz tę stronę w aplikacji mobilnej BREVA dla skanowania LiDAR"
        );
      }, 1000);
    }
  };

  return (
    <MobilePanelLayout>
      <div className="space-y-3  h-full">
        <div>
          <h1 className="text-lg font-bold text-text-primary ">Nowy pomiar</h1>
          <p className="text-text-muted text-sm">
            Wykonaj skan LiDAR dla najwyższej dokładności
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {/* <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Szczegóły pomiaru</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nazwa pomiaru</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="np. Pomiar kontrolny"
                  className="rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Notatka (opcjonalnie)</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="Dodatkowe informacje o pomiarze..."
                  className="rounded-xl"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card> */}
          <div className="bg-blue-50 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Wskazówki</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Użyj dobrego oświetlenia</li>
                  <li>• Unikaj cieni na piersiach</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sekcja skanowania LiDAR */}
        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="space-y-4">
            {lidarData ? (
              <div className="space-y-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium line-clamp-2 text-sm text-text-primary">
                    Skan LiDAR zakończony
                  </p>
                  <p className="text-xs text-text-muted">
                    Czas: {lidarData.duration}s
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLidarData(null);
                    setSelectedFile(null);
                  }}
                  className="rounded-xl">
                  Nowy skan
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={handleLiDARCapture}
                  className="w-full rounded-xl py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Camera className="h-5 w-5 mr-2" />
                  Zrób zdjęcie LiDAR
                </Button>
                <p className="text-xs text-text-muted text-center">
                  Najwyższa dokładność analizy
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sekcja uploadu pliku */}
        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="space-y-4">
            {selectedFile ? (
              <div className="space-y-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium line-clamp-2 text-sm text-text-primary">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="rounded-xl">
                  Wybierz inny plik
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="file"
                  id="file-upload"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  className="w-full rounded-xl py-4 text-lg font-semibold">
                  <Upload className="h-5 w-5 mr-2" />
                  Wybierz zdjęcie
                </Button>
                <p className="text-xs text-text-muted text-center">
                  JPG, PNG (max 10MB)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex space-x-3 pb-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 rounded-xl">
            Anuluj
          </Button>
          <Button
            type="submit"
            disabled={(!selectedFile && !lidarData) || isUploading}
            className="flex-1 rounded-xl">
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Przesyłanie...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Prześlij do analizy
              </>
            )}
          </Button>
        </div>
      </div>
    </MobilePanelLayout>
  );
}
