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
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Pobierz statystyki użytkowników
    const totalUsers = await prisma.user.count();
    const last7DaysDate = new Date();
    last7DaysDate.setDate(last7DaysDate.getDate() - 7);

    const newUsersLast7Days = await prisma.user.count({
      where: {
        createdAt: {
          gte: last7DaysDate,
        },
      },
    });

    // Pobierz statystyki pomiarów
    const totalMeasurements = await prisma.measurement.count();

    const measurementsLast7Days = await prisma.measurement.count({
      where: {
        createdAt: {
          gte: last7DaysDate,
        },
      },
    });

    // Pobierz pomiary z analizami AI i manualnymi
    const measurementsWithAI = await prisma.measurement.count({
      where: {
        aiAnalysis: {
          isNot: null,
        },
      },
    });

    const measurementsWithManual = await prisma.measurement.count({
      where: {
        manualAnalysis: {
          isNot: null,
        },
      },
    });

    // Pobierz ostatnie 7 dni pomiarów dla wykresu
    const dailyMeasurements = await prisma.measurement.groupBy({
      by: ["createdAt"],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: last7DaysDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Formatuj dane dzienne
    const dailyStats = dailyMeasurements.map((day) => ({
      date: day.createdAt.toISOString().split("T")[0],
      count: day._count.id,
    }));

    return res.status(200).json({
      users: {
        total: totalUsers,
        last7Days: newUsersLast7Days,
      },
      measurements: {
        total: totalMeasurements,
        last7Days: measurementsLast7Days,
        withAI: measurementsWithAI,
        withManual: measurementsWithManual,
      },
      dailyStats,
      period: {
        startDate: last7DaysDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return res.status(500).json({
      error: "Wystąpił błąd podczas pobierania statystyk",
    });
  }
}
