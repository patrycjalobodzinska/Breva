import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { measurementId, side } = req.query;

    if (!measurementId || !side) {
      return res
        .status(400)
        .json({ error: "Measurement ID and side are required" });
    }

    if (side !== "left" && side !== "right") {
      return res.status(400).json({ error: "Side must be 'left' or 'right'" });
    }

    const isAdmin = session.user.role === "ADMIN";

    // Sprawdź czy pomiar należy do użytkownika (admin ma dostęp do wszystkich)
    const measurement = await prisma.measurement?.findFirst({
      where: {
        id: measurementId as string,
        ...(isAdmin ? {} : { userId: session.user.id }),
      },
    });

    if (!measurement) {
      return res.status(404).json({ error: "Pomiar nie został znaleziony" });
    }

    // Sprawdź czy dane to JSON czy plik
    const contentType = req.headers["content-type"];

    if (contentType?.includes("application/json")) {
      // Obsługa danych JSON z aplikacji mobilnej
      const lidarData = req.body;

      if (!lidarData || !lidarData.background || !lidarData.object) {
        return res.status(400).json({ error: "Brak danych LiDAR" });
      }

      // Mock AI analysis result
      const aiResult = {
        volumeMl: Math.round((Math.random() * 800 + 200) * 100) / 100,
        confidence: Math.round((Math.random() * 0.23 + 0.75) * 100) / 100,
      };

      console.log(`🤖 Mock AI Analysis Result for ${side} breast:`, aiResult);
      console.log(`📱 LiDAR Data received:`, {
        background: lidarData.background ? "present" : "missing",
        object: lidarData.object ? "present" : "missing",
        timestamp: lidarData.timestamp || "unknown",
      });

      // Sprawdź czy analiza AI już istnieje
      const existingAnalysis = await prisma.breastAnalysis?.findFirst({
        where: {
          aiMeasurementId: measurementId as string,
        },
      });

      let breastAnalysis;
      const sideKey = side.toLowerCase();

      if (existingAnalysis) {
        // Aktualizuj istniejącą analizę AI
        const updateData: any = {};
        updateData[`${sideKey}VolumeMl`] = aiResult.volumeMl;
        updateData[`${sideKey}Confidence`] = aiResult.confidence;
        updateData[`${sideKey}FilePath`] = `lidar_data_${sideKey}_${Date.now()}.json`;
        updateData[`${sideKey}FileName`] = `lidar_scan_${sideKey}.json`;
        updateData[`${sideKey}FileSize`] = JSON.stringify(lidarData).length;
        updateData[`${sideKey}MimeType`] = "application/json";

        breastAnalysis = await prisma.breastAnalysis?.update({
          where: { id: existingAnalysis.id },
          data: updateData,
        });
      } else {
        // Utwórz nową analizę AI
        const createData: any = {
          aiMeasurementId: measurementId as string,
        };
        createData[`${sideKey}VolumeMl`] = aiResult.volumeMl;
        createData[`${sideKey}Confidence`] = aiResult.confidence;
        createData[`${sideKey}FilePath`] = `lidar_data_${sideKey}_${Date.now()}.json`;
        createData[`${sideKey}FileName`] = `lidar_scan_${sideKey}.json`;
        createData[`${sideKey}FileSize`] = JSON.stringify(lidarData).length;
        createData[`${sideKey}MimeType`] = "application/json";

        breastAnalysis = await prisma.breastAnalysis?.create({
          data: createData,
        });
      }

      // Zwróć zaktualizowany pomiar z analizami
      const updatedMeasurement = await prisma.measurement?.findUnique({
        where: { id: measurementId as string },
      });

      return res.status(200).json(updatedMeasurement);
    } else {
      // Obsługa tradycyjnych plików
      const form = formidable({
        maxFileSize: 300 * 1024 * 1024, // 300MB
        filter: ({ mimetype }) => {
          const allowedTypes = [
            "video/mp4",
            "video/quicktime",
            "image/jpeg",
            "image/png",
            "image/heic",
            "application/octet-stream", // For LiDAR files
          ];
          return allowedTypes.includes(mimetype || "");
        },
      });

      const [fields, files] = await form.parse(req);
      const file = Array.isArray(files.file) ? files.file[0] : files.file;

      if (!file) {
        return res.status(400).json({ error: "Brak pliku" });
      }

      const fileType = getFileType(file.originalFilename || "");
      if (!fileType) {
        return res.status(400).json({ error: "Nieobsługiwany format pliku" });
      }

      const maxSize = getMaxFileSize(fileType);
      if (file.size > maxSize) {
        return res.status(400).json({
          error: `Plik jest za duży. Maksymalny rozmiar: ${
            maxSize / (1024 * 1024)
          }MB`,
        });
      }

      // Mock AI analysis result
      const aiResult = {
        volumeMl: Math.round((Math.random() * 800 + 200) * 100) / 100,
        confidence: Math.round((Math.random() * 0.23 + 0.75) * 100) / 100,
      };

      console.log(`🤖 Mock AI Analysis Result for ${side} breast:`, aiResult);

      // Sprawdź czy analiza AI już istnieje
      const existingAnalysis = await prisma.breastAnalysis.findFirst({
        where: {
          aiMeasurementId: measurementId as string,
        },
      });

      let breastAnalysis;
      const sideKey = side.toLowerCase();

      if (existingAnalysis) {
        // Aktualizuj istniejącą analizę AI
        const updateData: any = {};
        updateData[`${sideKey}VolumeMl`] = aiResult.volumeMl;
        updateData[`${sideKey}Confidence`] = aiResult.confidence;
        updateData[`${sideKey}FilePath`] = file.filepath;
        updateData[`${sideKey}FileName`] = file.originalFilename;
        updateData[`${sideKey}FileSize`] = file.size;
        updateData[`${sideKey}MimeType`] = file.mimetype;

        breastAnalysis = await prisma.breastAnalysis.update({
          where: { id: existingAnalysis.id },
          data: updateData,
        });
      } else {
        // Utwórz nową analizę AI
        const createData: any = {
          aiMeasurementId: measurementId as string,
        };
        createData[`${sideKey}VolumeMl`] = aiResult.volumeMl;
        createData[`${sideKey}Confidence`] = aiResult.confidence;
        createData[`${sideKey}FilePath`] = file.filepath;
        createData[`${sideKey}FileName`] = file.originalFilename;
        createData[`${sideKey}FileSize`] = file.size;
        createData[`${sideKey}MimeType`] = file.mimetype;

        breastAnalysis = await prisma.breastAnalysis.create({
          data: createData,
        });
      }

      // Usuń plik tymczasowy
      fs.unlinkSync(file.filepath);

      // Zwróć zaktualizowany pomiar z analizami
      const updatedMeasurement = await prisma.measurement?.findUnique({
        where: { id: measurementId as string },
      });

      return res.status(200).json(updatedMeasurement);
    }
  } catch (error) {
    console.error("Error processing breast analysis:", error);
    return res.status(500).json({
      error: "Wystąpił błąd podczas analizy piersi",
    });
  }
}

function getFileType(filename: string): string | null {
  const extension = filename.toLowerCase().split(".").pop();
  const videoExtensions = ["mp4", "mov"];
  const imageExtensions = ["jpg", "jpeg", "png", "heic"];
  const lidarExtensions = ["ply", "las"];

  if (videoExtensions.includes(extension || "")) return "video";
  if (imageExtensions.includes(extension || "")) return "image";
  if (lidarExtensions.includes(extension || "")) return "lidar";
  return null;
}

function getMaxFileSize(fileType: string): number {
  switch (fileType) {
    case "video":
      return 300 * 1024 * 1024; // 300MB
    case "image":
      return 30 * 1024 * 1024; // 30MB
    case "lidar":
      return 200 * 1024 * 1024; // 200MB
    default:
      return 0;
  }
}
