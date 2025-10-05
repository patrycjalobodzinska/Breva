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

    const { userId } = req.query;

    const measurements = await prisma.measurement.findMany({
      where: { userId: userId as string },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(measurements);
  } catch (error) {
    console.error("Error fetching user measurements:", error);
    return res.status(500).json({
      error: "Wystąpił błąd podczas pobierania pomiarów użytkownika",
    });
  }
}
