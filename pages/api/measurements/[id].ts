import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { measurementUpdateSchema } from "@/lib/validators";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;
  const isAdmin = session.user.role === "ADMIN";

  if (req.method === "GET") {
    try {
      const measurement = await prisma.measurement.findFirst({
        where: {
          id: id as string,
          ...(isAdmin ? {} : { userId: session.user.id }),
        },
        include: {
          aiAnalysis: true,
          manualAnalysis: true,
          lidarCaptures: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      if (!measurement) {
        return res.status(404).json({ error: "Pomiar nie został znaleziony" });
      }

      return res.status(200).json(measurement);
    } catch (error) {
      console.error("Error fetching measurement:", error);
      return res.status(500).json({
        error: "Wystąpił błąd podczas pobierania pomiaru",
      });
    }
  }

  if (req.method === "PUT") {
    try {
      const { name, note } = measurementUpdateSchema.parse(req.body);

      const measurement = await prisma.measurement.findFirst({
        where: {
          id: id as string,
          ...(isAdmin ? {} : { userId: session.user.id }),
        },
      });

      if (!measurement) {
        return res.status(404).json({ error: "Pomiar nie został znaleziony" });
      }

      const updatedMeasurement = await prisma.measurement.update({
        where: { id: id as string },
        data: {
          ...(name && { name }),
          ...(note !== undefined && { note }),
        },
      });

      return res.status(200).json(updatedMeasurement);
    } catch (error) {
      console.error("Error updating measurement:", error);
      return res.status(500).json({
        error: "Wystąpił błąd podczas aktualizacji pomiaru",
      });
    }
  }

  if (req.method === "DELETE") {
    try {
      const measurement = await prisma.measurement.findFirst({
        where: {
          id: id as string,
          ...(isAdmin ? {} : { userId: session.user.id }),
        },
      });

      if (!measurement) {
        return res.status(404).json({ error: "Pomiar nie został znaleziony" });
      }

      await prisma.measurement.deleteMany({
        where: { id: id as string },
      });

      await prisma.measurement.delete({
        where: { id: id as string },
      });

      return res.status(200).json({ message: "Pomiar został usunięty" });
    } catch (error) {
      console.error("Error deleting measurement:", error);
      return res.status(500).json({
        error: "Wystąpił błąd podczas usuwania pomiaru",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
