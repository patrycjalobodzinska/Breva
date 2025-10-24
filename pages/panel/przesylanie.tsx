"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileVideo, FileImage, File, AlertCircle, Camera } from "lucide-react";
import { toast } from "sonner";
import PanelLayout from "@/components/PanelLayout";
import { WebViewBridge } from "@/components/WebViewBridge";

const ACCEPTED_FILE_TYPES = {
  video: [".mp4", ".mov"],
  image: [".jpg", ".jpeg", ".png", ".heic"],
  lidar: [".ply", ".las"],
};

const MAX_FILE_SIZES = {
  video: 300 * 1024 * 1024, // 300MB
  image: 30 * 1024 * 1024, // 30MB
  lidar: 200 * 1024 * 1024, // 200MB
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [lidarData, setLidarData] = useState<any>(null);
  const [uploadMethod, setUploadMethod] = useState<"file" | "lidar">("file");
  const router = useRouter();

  const getFileType = (file: File) => {
    const extension = file.name.toLowerCase().split(".").pop();
    if (ACCEPTED_FILE_TYPES.video.includes(`.${extension}`)) return "video";
    if (ACCEPTED_FILE_TYPES.image.includes(`.${extension}`)) return "image";
    if (ACCEPTED_FILE_TYPES.lidar.includes(`.${extension}`)) return "lidar";
    return null;
  };

  const validateFile = (file: File) => {
    const fileType = getFileType(file);
    if (!fileType) {
      toast.error("Nieobsługiwany format pliku");
      return false;
    }

    if (file.size > MAX_FILE_SIZES[fileType as keyof typeof MAX_FILE_SIZES]) {
      toast.error(
        `Plik jest za duży. Maksymalny rozmiar: ${
          MAX_FILE_SIZES[fileType as keyof typeof MAX_FILE_SIZES] /
          (1024 * 1024)
        }MB`
      );
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadMethod === "file" && !file) return;
    if (uploadMethod === "lidar" && !lidarData) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      
      if (uploadMethod === "file" && file) {
        formData.append("file", file);
      } else if (uploadMethod === "lidar" && lidarData) {
        // Dla LiDAR, tworzymy plik z danych
        const lidarFile = new File([lidarData.uri], `lidar_scan_${Date.now()}.mp4`, {
          type: "video/mp4"
        });
        formData.append("file", lidarFile);
        formData.append("lidarData", JSON.stringify(lidarData));
      }
      
      formData.append("note", note);
      formData.append("uploadMethod", uploadMethod);

      const response = await fetch("/api/uploads/analyze", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Analiza zakończona pomyślnie!");
        router.push(`/panel/pomiary/${result.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Wystąpił błąd podczas analizy");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas przesyłania pliku");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLiDARData = (data: any) => {
    setLidarData(data);
    setUploadMethod("lidar");
    toast.success("Dane LiDAR zostały pobrane!");
  };

  const getFileIcon = (file: File) => {
    const fileType = getFileType(file);
    switch (fileType) {
      case "video":
        return <FileVideo className="h-8 w-8 text-primary" />;
      case "image":
        return <FileImage className="h-8 w-8 text-primary" />;
      case "lidar":
        return <File className="h-8 w-8 text-primary" />;
      default:
        return <Upload className="h-8 w-8 text-text-muted" />;
    }
  };

  return (
    <PanelLayout>
      <div className="max-w-2xl mx-auto">
        <Card className="rounded-2xl bg-white shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Prześlij plik do analizy</CardTitle>
            <CardDescription>
              Wybierz plik wideo, zdjęcie lub dane LiDAR do analizy objętości
              piersi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Upload Method Selection */}
              <div className="space-y-4">
                <Label>Wybierz metodę analizy</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all ${
                      uploadMethod === "file" 
                        ? "border-primary bg-primary/5" 
                        : "border-gray-200 hover:border-primary/30"
                    }`}
                    onClick={() => setUploadMethod("file")}
                  >
                    <CardContent className="p-4 text-center">
                      <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h3 className="font-semibold">Prześlij plik</h3>
                      <p className="text-sm text-text-muted">
                        Wideo, zdjęcia, pliki LiDAR
                      </p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all ${
                      uploadMethod === "lidar" 
                        ? "border-primary bg-primary/5" 
                        : "border-gray-200 hover:border-primary/30"
                    }`}
                    onClick={() => setUploadMethod("lidar")}
                  >
                    <CardContent className="p-4 text-center">
                      <Camera className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h3 className="font-semibold">Skan LiDAR</h3>
                      <p className="text-sm text-text-muted">
                        Najwyższa dokładność
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* File Upload */}
              {uploadMethod === "file" && (
                <div className="space-y-2">
                  <Label htmlFor="file">Plik do analizy</Label>
                  <div className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".mp4,.mov,.jpg,.jpeg,.png,.heic,.ply,.las"
                      className="hidden"
                    />
                    <label htmlFor="file" className="cursor-pointer">
                      {file ? (
                        <div className="space-y-2">
                          {getFileIcon(file)}
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-text-muted">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-12 w-12 text-primary mx-auto" />
                          <p className="font-medium">Kliknij, aby wybrać plik</p>
                          <p className="text-sm text-text-muted">
                            Wspierane formaty: MP4, MOV, JPG, PNG, HEIC, PLY, LAS
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* LiDAR Scanner */}
              {uploadMethod === "lidar" && (
                <div className="space-y-2">
                  <Label>Skan LiDAR</Label>
                  <WebViewBridge onLiDARData={handleLiDARData} />
                </div>
              )}

              {/* Note */}
              <div className="space-y-2">
                <Label htmlFor="note">Notatka (opcjonalna)</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Dodaj notatkę do tego pomiaru..."
                  className="rounded-2xl"
                  rows={3}
                />
              </div>

              {/* File Info */}
              <div className="bg-accent-1 rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-2">
                      Wymagania dotyczące plików:
                    </p>
                    <ul className="space-y-1 text-text-muted">
                      <li>• Wideo: MP4, MOV (max 300MB)</li>
                      <li>• Zdjęcia: JPG, PNG, HEIC (max 30MB)</li>
                      <li>• LiDAR: PLY, LAS (max 200MB)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={
                  (uploadMethod === "file" && !file) || 
                  (uploadMethod === "lidar" && !lidarData) || 
                  isUploading
                }
                className="w-full rounded-2xl bg-primary hover:bg-primary-dark">
                {isUploading ? "Analizowanie..." : "Rozpocznij analizę"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PanelLayout>
  );
}
