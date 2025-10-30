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

    const {
      search,
      sort = "createdAt",
      order = "desc",
      page = "1",
      pageSize = "10",
    } = req.query;

    const [allMeasurements, totalCount] = await Promise.all([
      prisma.measurement?.findMany({
        where: {
          userId: session.user.id,
          ...(search && {
            OR: [
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
            ],
          }),
        },
        include: {
          aiAnalysis: true,
          manualAnalysis: true,
        },
        orderBy: { [sort as string]: order },
      }),
      prisma.measurement?.count({
        where: {
          userId: session.user.id,
          ...(search && {
            OR: [
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
            ],
          }),
        },
      }),
    ]);

    // Na razie zwracamy wszystkie pomiary - filtrowanie będzie działać gdy Prisma będzie zaktualizowane
    const measurements = allMeasurements || [];

    // Paginacja na poziomie aplikacji
    const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);
    const take = parseInt(pageSize as string);
    const paginatedMeasurements = measurements.slice(skip, skip + take);
    const filteredTotalCount = measurements.length;

    const totalPages = Math.ceil(
      filteredTotalCount / parseInt(pageSize as string)
    );

    return res.status(200).json({
      measurements: paginatedMeasurements,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(pageSize as string),
        totalCount: filteredTotalCount,
        totalPages,
        hasNext: parseInt(page as string) < totalPages,
        hasPrev: parseInt(page as string) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching measurements:", error);
    return res.status(500).json({
      error: "Wystąpił błąd podczas pobierania pomiarów",
    });
  }
}
