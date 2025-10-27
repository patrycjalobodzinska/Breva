import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import MobilePanelLayout from "@/components/layout/MobilePanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, ButtonUpload } from "@/components/ui/button";

import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

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
