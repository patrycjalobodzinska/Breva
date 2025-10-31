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

    const { search, page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search as string,
            mode: "insensitive" as const,
          },
        },
        {
          note: {
            contains: search as string,
            mode: "insensitive" as const,
          },
        },
        {
          user: {
            email: {
              contains: search as string,
              mode: "insensitive" as const,
            },
          },
        },
        {
          user: {
            name: {
              contains: search as string,
              mode: "insensitive" as const,
            },
          },
        },
      ];
    }

    const [measurements, totalCount] = await Promise.all([
      prisma.measurement.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          aiAnalysis: true,
          manualAnalysis: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.measurement.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      measurements,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching measurements:", error);
    return res.status(500).json({
      error: "Wystąpił błąd podczas pobierania pomiarów",
    });
  }
}
