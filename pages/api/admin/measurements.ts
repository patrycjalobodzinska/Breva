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

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [allMeasurements, totalCount] = await Promise.all([
      prisma.measurement?.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.measurement?.count(),
    ]);

    // Na razie zwracamy wszystkie pomiary - filtrowanie będzie działać gdy Prisma będzie zaktualizowane
    const measurements = allMeasurements || [];

    // Paginacja na poziomie aplikacji
    const paginatedMeasurements = measurements.slice(skip, skip + limit);
    const filteredTotalCount = measurements.length;

    const totalPages = Math.ceil(filteredTotalCount / limit);

    return res.status(200).json({
      measurements: paginatedMeasurements,
      pagination: {
        page,
        limit,
        totalCount: filteredTotalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching measurements:", error);
    return res.status(500).json({
      error: "Wystąpił błąd podczas pobierania pomiarów",
    });
  }
}
