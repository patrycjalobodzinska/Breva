"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
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
import { Heart, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { registerSchema, type RegisterFormData } from "@/lib/validations";

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFormErrors({});

    try {
      const validatedData = registerSchema.parse(formData);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: validatedData.email,
          password: validatedData.password,
          name: validatedData.name,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        toast.success("Konto zostało utworzone pomyślnie!");

        // Poczekaj chwilę aby upewnić się, że użytkownik jest zapisany w bazie
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Automatyczne logowanie po rejestracji
        try {
          const result = await signIn("credentials", {
            email: validatedData.email,
            password: validatedData.password,
            redirect: false,
          });

          console.log("🔐 Rezultat logowania:", result);

          if (result?.ok) {
            toast.success("Logowanie udane!");
            // Użyj window.location.href aby wymusić pełne przeładowanie z nową sesją
            setTimeout(() => {
              window.location.href = "/panel";
            }, 500);
          } else {
            console.error("❌ Błąd logowania:", result?.error);
            toast.error(
              "Nie udało się automatycznie zalogować. Zaloguj się ręcznie."
            );
            setTimeout(() => {
              router.push("/logowanie");
            }, 2000);
          }
        } catch (loginError) {
          console.error(
            "❌ Błąd podczas automatycznego logowania:",
            loginError
          );
          toast.error("Wystąpił błąd. Spróbuj zalogować się ręcznie.");
          setTimeout(() => {
            router.push("/logowanie");
          }, 2000);
        }
      } else {
        const data = await response.json();
        console.log(data);
        setError(data.error || "Wystąpił błąd podczas rejestracji");
      }
    } catch (validationError: any) {
      console.log(validationError);
      if (validationError.issues) {
        const errors: Record<string, string> = {};
        validationError.issues.forEach((err: any) => {
          if (err.path && err.path.length > 0) {
            errors[err.path[0]] = err.message;
          }
        });
        setFormErrors(errors);
      } else {
        setError("Wystąpił błąd podczas rejestracji");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center p-4">
        <Card className="min-w-full md:min-w-md bg-white/90 max-w-md rounded-2xl shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Image
                src="/logo.png"
                alt="BREVA Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="text-2xl font-bold text-text-primary">
                BREVA
              </span>
            </div>
            <CardTitle className="text-2xl text-success">
              Konto utworzone!
            </CardTitle>
            <CardDescription>
              Twoje konto zostało pomyślnie utworzone
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br flex-col from-accent-1 to-accent-2 flex items-center justify-center p-4">
      <Card className=" md:min-w-md min-w-full bg-white/90 border-none rounded-2xl shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Image
              src="/logo.png"
              alt="BREVA Logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className="text-2xl font-bold text-text-primary">BREVA</span>
          </div>
          <CardTitle className="text-2xl">Zarejestruj się</CardTitle>
          <CardDescription>Utwórz konto, aby rozpocząć analizę</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Imię
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Twoje imię"
                className={`rounded-2xl ${
                  formErrors.name ? "border-red-500" : ""
                }`}
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  minLength={6}
                  className={`rounded-2xl pr-10 ${
                    formErrors.password ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary">
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2">
                Potwierdź hasło
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                  minLength={6}
                  className={`rounded-2xl pr-10 ${
                    formErrors.confirmPassword ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary">
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.confirmPassword}
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
