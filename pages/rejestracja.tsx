"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { signIn } from "next-auth/react";
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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Hasła nie są identyczne");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        toast.success("Konto zostało utworzone pomyślnie!");

        // Automatyczne logowanie po rejestracji
        try {
          const result = await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });

          if (result?.ok) {
            // Logowanie się powiodło - przekieruj do panelu
            setTimeout(() => {
              router.push("/panel");
            }, 1500);
          } else {
            // Logowanie się nie powiodło - przekieruj do strony logowania
            setTimeout(() => {
              router.push("/logowanie");
            }, 2000);
          }
        } catch (loginError) {
          console.error("Błąd podczas automatycznego logowania:", loginError);
          // W przypadku błędu, przekieruj do strony logowania
          setTimeout(() => {
            router.push("/logowanie");
          }, 2000);
        }
      } else {
        const data = await response.json();
        setError(data.error || "Wystąpił błąd podczas rejestracji");
      }
    } catch (error) {
      setError("Wystąpił błąd podczas rejestracji");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-text-primary">
                BREVA
              </span>
            </div>
            <CardTitle className="text-2xl text-success">
              Konto utworzone!
            </CardTitle>
            <CardDescription>
              Twoje konto zostało pomyślnie utworzone. Logujemy Cię
              automatycznie...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-text-primary">BREVA</span>
          </div>
          <CardTitle className="text-2xl">Zarejestruj się</CardTitle>
          <CardDescription>Utwórz konto, aby rozpocząć analizę</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Imię (opcjonalne)
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Twoje imię"
                className="rounded-2xl"
              />
            </div>

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
                className="rounded-2xl"
              />
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
                minLength={6}
                className="rounded-2xl"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2">
                Potwierdź hasło
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="••••••••"
                required
                minLength={6}
                className="rounded-2xl"
              />
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
              {isLoading ? "Tworzenie konta..." : "Zarejestruj się"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted">
              Masz już konto?{" "}
              <Link href="/logowanie" className="text-primary hover:underline">
                Zaloguj się
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
