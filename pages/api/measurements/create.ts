import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createMeasurementSchema = z.object({
  name: z.string().min(1, "Nazwa pomiaru jest wymagana").max(100),
  note: z.string().max(500).optional(),
});

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

    const { name, note } = createMeasurementSchema.parse(req.body);
    const measurement = await prisma.measurement.create({
      data: {
        userId: session.user.id,
        name,
        note: note || null,
        source: "MANUAL",
        leftVolumeMl: 0,
        rightVolumeMl: 0,
      },
    });

    return res.status(201).json(measurement);
  } catch (error) {
    console.error("Error creating measurement:", error);
    return res.status(500).json({
      error: "Wystąpił błąd podczas tworzenia pomiaru",
    });
  }
}
