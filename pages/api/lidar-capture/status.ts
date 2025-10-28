import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
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

    // Pobierz status LiDAR capture
    const lidarCapture = await prisma.lidarCapture?.findFirst({
      where: {
        measurementId: measurementId as string,
        side: (side as string).toUpperCase(),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!lidarCapture) {
      return res.status(404).json({ error: "LiDAR capture not found" });
    }

    // Sprawdź czy pomiar należy do użytkownika
    const measurement = await prisma.measurement?.findFirst({
      where: {
        id: measurementId as string,
        userId: session.user.id,
      },
    });

    if (!measurement) {
      return res.status(404).json({ error: "Measurement not found" });
    }

    return res.status(200).json({
      requestId: lidarCapture.requestId,
      status: lidarCapture.status,
      estimatedVolume: lidarCapture.estimatedVolume,
      createdAt: lidarCapture.createdAt,
      updatedAt: lidarCapture.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching LiDAR capture status:", error);
    return res.status(500).json({
      error: "Wystąpił błąd podczas pobierania statusu",
    });
  }
}
