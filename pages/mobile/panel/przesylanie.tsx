import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import MobilePanelLayout from "@/components/layout/MobilePanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, ButtonUpload } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  Camera,
  FileImage,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { WebViewBridge } from "@/components/WebViewBridge";

export default function MobileUploadPage() {
  const { data: session } = useSession();
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

  const handleLiDARData = (data: any) => {
    setLidarData(data);
    setSelectedFile(null); // Wyczyść wybrany plik
    if (!formData.name) {
      setFormData((prev) => ({
        ...prev,
        name: `Skan LiDAR ${new Date().toLocaleDateString()}`,
      }));
    }
    toast.success("Dane LiDAR zostały pobrane!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile && !lidarData) {
      toast.error("Wykonaj skan LiDAR lub wybierz plik");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Podaj nazwę pomiaru");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      
      if (lidarData) {
        // Dla LiDAR, tworzymy plik z danych
        const lidarFile = new File([lidarData.uri], `lidar_scan_${Date.now()}.mp4`, {
          type: "video/mp4"
        });
        formDataToSend.append("file", lidarFile);
        formDataToSend.append("lidarData", JSON.stringify(lidarData));
        formDataToSend.append("uploadMethod", "lidar");
      } else if (selectedFile) {
        formDataToSend.append("file", selectedFile);
        formDataToSend.append("uploadMethod", "file");
      }
      
      formDataToSend.append("name", formData.name);
      if (formData.note) {
        formDataToSend.append("note", formData.note);
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          toast.success("Pomiar został przesłany pomyślnie!");
          router.push(`/mobile/panel/pomiary/${response.id}`);
        } else {
          const errorData = JSON.parse(xhr.responseText);
          toast.error(errorData.error || "Wystąpił błąd podczas przesyłania");
        }
        setIsUploading(false);
        setUploadProgress(0);
      });

      xhr.addEventListener("error", () => {
        toast.error("Wystąpił błąd podczas przesyłania");
        setIsUploading(false);
        setUploadProgress(0);
      });

      xhr.open("POST", "/api/uploads/analyze");
      xhr.send(formDataToSend);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Wystąpił błąd podczas przesyłania");
      setIsUploading(false);
      setUploadProgress(0);
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

        <form
          onSubmit={handleSubmit}
          className="space-y-6 flex flex-col justify-between h-full">
          <div className="flex flex-col gap-4">
            {" "}
            <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Skan LiDAR</CardTitle>
              </CardHeader>
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
                    <WebViewBridge onLiDARData={handleLiDARData} />
                  </div>
                )}

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">Przesyłanie...</span>
                      <span className="font-medium">
                        {Math.round(uploadProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
        </form>
      </div>
    </MobilePanelLayout>
  );
}
