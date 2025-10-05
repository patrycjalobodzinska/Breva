import { NextApiRequest, NextApiResponse } from "next";
import { registerSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Użytkownik z tym adresem email już istnieje",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "USER",
      },
    });

    return res.status(201).json({
      message: "Konto zostało utworzone pomyślnie",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      error: "Wystąpił błąd podczas rejestracji",
    });
  }
}
