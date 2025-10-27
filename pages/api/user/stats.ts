import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Pobierz użytkownika
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Oblicz datę sprzed 7 dni
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Pobierz statystyki pomiarów dla tego użytkownika
    const [
      totalMeasurements,
      recentMeasurements,
      aiMeasurements,
      manualMeasurements,
      recentAiMeasurements,
      recentManualMeasurements,
    ] = await Promise.all([
      // Całkowita liczba pomiarów użytkownika
      prisma.measurement?.count({
        where: { userId: user.id },
      }),

      // Pomiary użytkownika z ostatnich 7 dni
      prisma.measurement?.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),

      // Pomiary AI użytkownika
      prisma.measurement?.count({
        where: {
          userId: user.id,
          source: "AI",
        },
      }),

      // Pomiary ręczne użytkownika
      prisma.measurement?.count({
        where: {
          userId: user.id,
          source: "MANUAL",
        },
      }),

      // Pomiary AI użytkownika z ostatnich 7 dni
      prisma.measurement?.count({
        where: {
          userId: user.id,
          source: "AI",
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),

      // Pomiary ręczne użytkownika z ostatnich 7 dni
      prisma.measurement?.count({
        where: {
          userId: user.id,
          source: "MANUAL",
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
    ]);

    // Pobierz statystyki dzienne z ostatnich 7 dni dla użytkownika
    const dailyStats = await prisma.measurement?.groupBy({
      by: ["createdAt"],
      where: {
        userId: user.id,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Formatuj statystyki dzienne
    const formattedDailyStats = dailyStats.map((stat) => ({
      date: stat.createdAt.toISOString().split("T")[0],
      count: stat._count.id,
    }));

    // Oblicz średnią objętość dla użytkownika
    const avgVolumeStats = await prisma.measurement?.aggregate({
      where: {
        userId: user.id,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _avg: {
        leftVolumeMl: true,
        rightVolumeMl: true,
      },
    });

    const stats = {
      measurements: {
        total: totalMeasurements,
        last7Days: recentMeasurements,
        ai: {
          total: aiMeasurements,
          last7Days: recentAiMeasurements,
        },
        manual: {
          total: manualMeasurements,
          last7Days: recentManualMeasurements,
        },
      },
      dailyStats: formattedDailyStats,
      averageVolume: {
        left: avgVolumeStats._avg.leftVolumeMl
          ? Number(avgVolumeStats._avg.leftVolumeMl.toFixed(2))
          : 0,
        right: avgVolumeStats._avg.rightVolumeMl
          ? Number(avgVolumeStats._avg.rightVolumeMl?.toFixed(2))
          : 0,
      },
      period: {
        startDate: sevenDaysAgo.toISOString(),
        endDate: new Date().toISOString(),
      },
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error("User stats error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  } finally {
    await prisma.$disconnect();
  }
}
