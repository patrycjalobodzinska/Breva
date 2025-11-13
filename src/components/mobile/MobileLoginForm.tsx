"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { loginSchema, type LoginFormData } from "@/lib/validations";

interface MobileLoginFormProps {
  onSwitchToRegister: () => void;
}

export const MobileLoginForm = ({
  onSwitchToRegister,
}: MobileLoginFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFormErrors({});

    // Walidacja z Zod
    try {
      const validatedData = loginSchema.parse(formData);

      // Jeśli walidacja przeszła, kontynuuj z logowaniem
      try {
        const result = await signIn("credentials", {
          email: validatedData.email,
          password: validatedData.password,
          redirect: false,
        });

        if (result?.error) {
          // Mapowanie błędów NextAuth na polskie komunikaty
          const errorMessages: Record<string, string> = {
            CredentialsSignin: "Nieprawidłowy email lub hasło",
            Default: "Wystąpił błąd podczas logowania. Spróbuj ponownie.",
          };

          const errorMessage =
            errorMessages[result.error] || errorMessages.Default;
          setError(errorMessage);
          toast.error(errorMessage);
        } else {
          toast.success("Zalogowano pomyślnie!");
          router.push("/mobile/panel");
        }
      } catch (error) {
        setError("Wystąpił błąd podczas logowania");
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

  return (
    <div className="min-h-screen z-10  flex flex-col">
      <div className="flex-col flex   px-6 py-6 pt-16">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center  mb-1 mt-6">
            <Image
              src="/logo.png"
              alt="BREVA"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Witaj ponownie!
          </h1>
          <p className="text-text-muted">Zaloguj się do swojego konta</p>
        </div>

        <Card className="rounded-2xl pt-4 bg-white/40 backdrop-blur-sm border-0 shadow-lg">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="twoj@email.com"
                  className={`rounded-xl ${
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
                    placeholder="••••••••"
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl py-4 text-lg font-semibold">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Logowanie...
                  </>
                ) : (
                  <>
                    Zaloguj się
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-text-muted mb-4">Nie masz jeszcze konta?</p>
          <Button
            variant="outline"
            onClick={onSwitchToRegister}
            className="w-full rounded-xl py-4 text-lg">
            Zarejestruj się
          </Button>
        </div>
      </div>
    </div>
  );
};
