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

    console.log("📊 Measurements API - User ID:", session.user.id);
    console.log("📊 Measurements API - User Role:", session.user.role);

    const {
      search,
      sort = "createdAt",
      order = "desc",
      page = "1",
      pageSize = "10",
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);
    const take = parseInt(pageSize as string);

    const whereClause: any = {
      userId: session.user.id,
    };

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
      ];
    }

    const [measurements, totalCount] = await Promise.all([
      prisma.measurement.findMany({
        where: whereClause,
        include: {
          aiAnalysis: true,
          manualAnalysis: true,
        },
        orderBy: { [sort as string]: order },
        skip,
        take,
      }),
      prisma.measurement.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / take);

    console.log("📊 Total measurements found:", totalCount);
    console.log("📊 Paginated measurements:", measurements.length);

    return res.status(200).json({
      measurements,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        totalCount,
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
