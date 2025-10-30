import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { manualMeasurementSchema } from "@/lib/validators";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.query;
    const { leftVolumeMl, rightVolumeMl, name, note } =
      manualMeasurementSchema.parse(req.body);

    const isAdmin = session.user.role === "ADMIN";

    const measurement = await prisma.measurement?.findFirst({
      where: {
        id: id as string,
        ...(isAdmin ? {} : { userId: session.user.id }),
      },
    });

    if (!measurement) {
      return res
        .status(404)
        .json({ error: "Pomiar ręczny nie został znaleziony" });
    }

    const updatedMeasurement = await prisma.measurement?.update({
      where: { id: id as string },
      data: {
        leftVolumeMl,
        rightVolumeMl,
        ...(name && { name }),
        ...(note !== undefined && { note }),
      },
    });

    return res.status(200).json(updatedMeasurement);
  } catch (error) {
    console.error("Error updating manual measurement:", error);
    return res.status(500).json({
      error: "Wystąpił błąd podczas aktualizacji pomiaru ręcznego",
    });
  }
}
