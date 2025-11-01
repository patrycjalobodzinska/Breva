"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { registerSchema, type RegisterFormData } from "@/lib/validations";

interface MobileRegisterFormProps {
  onSwitchToLogin: () => void;
}

export const MobileRegisterForm = ({
  onSwitchToLogin,
}: MobileRegisterFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFormErrors({});

    // Walidacja z Zod
    try {
      const validatedData = registerSchema.parse(formData);

      // Jeśli walidacja przeszła, kontynuuj z rejestracją
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: validatedData.name,
            email: validatedData.email,
            password: validatedData.password,
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
                window.location.href = "/mobile/panel";
              }, 500);
            } else {
              console.error("❌ Błąd logowania:", result?.error);
              toast.error(
                "Nie udało się automatycznie zalogować. Zaloguj się ręcznie."
              );
              // Logowanie się nie powiodło - przekieruj do widoku logowania
              setTimeout(() => {
                onSwitchToLogin();
                setSuccess(false);
              }, 2000);
            }
          } catch (loginError) {
            console.error(
              "❌ Błąd podczas automatycznego logowania:",
              loginError
            );
            toast.error("Wystąpił błąd. Spróbuj zalogować się ręcznie.");
            // W przypadku błędu, przekieruj do widoku logowania
            setTimeout(() => {
              onSwitchToLogin();
              setSuccess(false);
            }, 2000);
          }
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Wystąpił błąd podczas rejestracji");
        }
      } catch (error) {
        setError("Wystąpił błąd podczas rejestracji");
      }
    } catch (validationError: any) {
      // Obsługa błędów walidacji Zod
      if (validationError.issues) {
        const errors: Record<string, string> = {};
        validationError.issues.forEach((err: any) => {
          if (err.path && err.path.length > 0) {
            errors[err.path[0]] = err.message;
          }
        });
        setFormErrors(errors);
      } else {
        setError("Wystąpił błąd walidacji formularza");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen z-10 bg-gradient-to-br from-accent-1 to-accent-2 flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              Konto utworzone!
            </h1>
            <p className="text-text-muted mb-6">
              Twoje konto zostało pomyślnie utworzone
            </p>
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen z-10 flex flex-col">
      <div className="flex-col flex  px-6  pt-16 py-6">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-1 mt-6">
            <Heart className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Dołącz do BREVA
          </h1>
          <p className="text-text-muted">Utwórz konto i rozpocznij analizę</p>
        </div>

        <Card className="rounded-2xl text-sm border-0 bg-white/40 backdrop-blur-sm pt-4">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-2 ">
                <Label htmlFor="name" className="text-sm pb-1">
                  Imię
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Twoje imię"
                  className={`rounded-xl text-xs ${
                    formErrors.name ? "border-red-500" : ""
                  }`}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm pb-1">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="twoj@email.com"
                  className={`rounded-xl sm:text-sm text-xs ${
                    formErrors.email ? "border-red-500" : ""
                  }`}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Hasło</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Minimum 6 znaków"
                    className={`rounded-xl pr-10 ${
                      formErrors.password ? "border-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted">
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
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
                    placeholder="Powtórz hasło"
                    className={`rounded-xl pr-10 ${
                      formErrors.confirmPassword ? "border-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted">
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl py-4 mt-2 text-lg font-semibold">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Tworzenie konta...
                  </>
                ) : (
                  <>
                    Utwórz konto
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-3">
          <p className="text-text-muted mb-2">Masz już konto?</p>
          <Button
            variant="outline"
            onClick={onSwitchToLogin}
            className="w-full rounded-xl py-4 text-lg">
            Zaloguj się
          </Button>
        </div>
      </div>
    </div>
  );
};
