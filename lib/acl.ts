import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Nieautoryzowany dostęp");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();

  if (session.user.role !== "ADMIN") {
    throw new Error("Brak uprawnień administratora");
  }

  return session;
}

export async function requireUser() {
  const session = await requireAuth();

  if (session.user.role !== "USER" && session.user.role !== "ADMIN") {
    throw new Error("Brak uprawnień użytkownika");
  }

  return session;
}
