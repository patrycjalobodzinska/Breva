"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, type LoginFormData } from "@/lib/validations";

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFormErrors({});

    try {
      const validatedData = loginSchema.parse(formData);

      const result = await signIn("credentials", {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Nieprawidłowy email lub hasło");
      } else {
        toast.success("Zalogowano pomyślnie!");

        const response = await fetch("/api/auth/session");
        const session = await response.json();

        if (session?.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/panel");
        }
      }
    } catch (validationError: any) {
      if (validationError.errors) {
        const errors: Record<string, string> = {};
        validationError.errors.forEach((err: any) => {
          if (err.path) {
            errors[err.path[0]] = err.message;
          }
        });
        setFormErrors(errors);
      } else {
        setError("Wystąpił błąd podczas logowania");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 border-none rounded-2xl shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-text-primary">BREVA</span>
          </div>
          <CardTitle className="text-2xl">Zaloguj się</CardTitle>
          <CardDescription>
            Wprowadź swoje dane, aby uzyskać dostęp do panelu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="twoj@email.com"
                required
                className={`rounded-2xl ${
                  formErrors.email ? "border-red-500" : ""
                }`}
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2">
                Hasło
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                required
                className={`rounded-2xl ${
                  formErrors.password ? "border-red-500" : ""
                }`}
              />
              {formErrors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.password}
                </p>
              )}
            </div>

            {error && (
              <div className="text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-2xl bg-primary hover:bg-primary-dark"
              disabled={isLoading}>
              {isLoading ? "Logowanie..." : "Zaloguj się"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Nie masz konta?{" "}
              <Link
                href="/rejestracja"
                className="text-primary hover:underline">
                Zarejestruj się
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
