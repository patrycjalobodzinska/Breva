import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { manualMeasurementSchema } from "@/lib/validators";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
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

    const baseline = await prisma.measurement?.findFirst({
      where: {
        id: id as string,
        userId: session.user.id,
      },
    });

    if (!baseline) {
      return res
        .status(404)
        .json({ error: "Pomiar bazowy nie został znaleziony" });
    }

    const manualMeasurement = await prisma.measurement?.create({
      data: {
        userId: session.user.id,
        name: name || `Pomiar ręczny ${new Date().toLocaleDateString()}`,
        note,
        analyses: {
          create: {
            measurementType: "MANUAL",
            leftVolumeMl,
            rightVolumeMl,
          },
        },
      },
    });

    return res.status(201).json(manualMeasurement);
  } catch (error) {
    console.error("Error creating manual measurement:", error);
    return res.status(500).json({
      error: "Wystąpił błąd podczas tworzenia pomiaru ręcznego",
    });
  }
}
