import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
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
    const note = Array.isArray(fields.note) ? fields.note[0] : fields.note;

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

    const aiResult = {
      leftVolumeMl: Math.round((Math.random() * 800 + 200) * 100) / 100,
      rightVolumeMl: Math.round((Math.random() * 800 + 200) * 100) / 100,
      confidence: Math.round((Math.random() * 0.23 + 0.75) * 100) / 100,
      processingId: `mock_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    };

    console.log("🤖 Mock AI Analysis Result:", aiResult);

    const measurement = await prisma.measurement?.create({
      data: {
        userId: session.user.id,
        name: (file.originalFilename || "").replace(/\.[^/.]+$/, ""),
        note: note || null,
        source: "AI",
        leftVolumeMl: aiResult.leftVolumeMl,
        rightVolumeMl: aiResult.rightVolumeMl,
      },
    });

    fs.unlinkSync(file.filepath);

    return res.status(200).json(measurement);
  } catch (error) {
    console.error("Error processing upload:", error);
    return res.status(500).json({
      error: "Wystąpił błąd podczas analizy pliku",
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
