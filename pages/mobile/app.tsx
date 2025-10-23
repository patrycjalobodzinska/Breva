"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowRight, Eye, EyeOff, CheckCircle, User, Lock } from "lucide-react";
import { toast } from "sonner";
import { MobileHeroSection } from "@/components/sections/MobileHeroSection";

type ViewState = "home" | "login" | "register" | "success";

export default function MobileApp() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewState>("home");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Login form data
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  
  // Register form data
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Redirect if already logged in
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-text-muted">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (session) {
    router.push("/mobile/panel");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: loginData.email,
        password: loginData.password,
        redirect: false,
      });

      if (result?.ok) {
        toast.success("Zalogowano pomyślnie!");
        router.push("/mobile/panel");
      } else {
        setError("Nieprawidłowy email lub hasło");
      }
    } catch (error) {
      setError("Wystąpił błąd podczas logowania");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Hasła nie są identyczne");
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków");
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
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        toast.success("Konto zostało utworzone pomyślnie!");
        
        // Automatyczne logowanie po rejestracji
        try {
          const result = await signIn("credentials", {
            email: registerData.email,
            password: registerData.password,
            redirect: false,
          });

          if (result?.ok) {
            setTimeout(() => {
              router.push("/mobile/panel");
            }, 1500);
          } else {
            setTimeout(() => {
              setCurrentView("login");
            }, 2000);
          }
        } catch (loginError) {
          console.error("Błąd podczas automatycznego logowania:", loginError);
          setTimeout(() => {
            setCurrentView("login");
          }, 2000);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Wystąpił błąd podczas rejestracji");
      }
    } catch (error) {
      setError("Wystąpił błąd podczas rejestracji");
    } finally {
      setIsLoading(false);
    }
  };

  // Success view after registration
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-1 to-accent-2 flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              Konto utworzone!
            </h1>
            <p className="text-text-muted mb-6">
              Twoje konto zostało pomyślnie utworzone. Logujemy Cię automatycznie...
            </p>
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-1 to-accent-2">
      {currentView === "home" && <MobileHeroSection />}
      
      {currentView === "home" && (
        <div className="px-6 pb-8">
          <div className="space-y-4">
            <Button
              onClick={() => setCurrentView("register")}
              size="lg"
              className="w-full rounded-2xl bg-primary hover:bg-primary-dark text-white py-4 text-lg font-semibold">
              Rozpocznij analizę
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              onClick={() => setCurrentView("login")}
              variant="outline"
              size="lg"
              className="w-full rounded-2xl border-primary text-primary hover:bg-primary/10 py-4 text-lg">
              Zaloguj się
            </Button>
          </div>
        </div>
      )}

      {currentView === "login" && (
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Witaj z powrotem
            </h1>
            <p className="text-text-muted">Zaloguj się do swojego konta</p>
          </div>

          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Logowanie</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    placeholder="twoj@email.com"
                    className="rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Hasło</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      placeholder="Twoje hasło"
                      className="rounded-xl pr-10"
                      required
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
            <p className="text-text-muted mb-4">Nie masz konta?</p>
            <Button
              onClick={() => setCurrentView("register")}
              variant="outline"
              className="w-full rounded-xl py-4 text-lg">
              Utwórz konto
            </Button>
          </div>

          <div className="text-center mt-4">
            <Button
              onClick={() => setCurrentView("home")}
              variant="ghost"
              className="text-sm text-text-muted hover:text-primary">
              ← Wróć do strony głównej
            </Button>
          </div>
        </div>
      )}

      {currentView === "register" && (
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Dołącz do BREVA
            </h1>
            <p className="text-text-muted">Utwórz konto i rozpocznij analizę</p>
          </div>

          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Rejestracja</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="register-name">Imię</Label>
                  <Input
                    id="register-name"
                    type="text"
                    value={registerData.name}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, name: e.target.value })
                    }
                    placeholder="Twoje imię"
                    className="rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, email: e.target.value })
                    }
                    placeholder="twoj@email.com"
                    className="rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Hasło</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, password: e.target.value })
                      }
                      placeholder="Minimum 6 znaków"
                      className="rounded-xl pr-10"
                      required
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Potwierdź hasło</Label>
                  <div className="relative">
                    <Input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Powtórz hasło"
                      className="rounded-xl pr-10"
                      required
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
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl py-4 text-lg font-semibold">
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

          <div className="text-center mt-6">
            <p className="text-text-muted mb-4">Masz już konto?</p>
            <Button
              onClick={() => setCurrentView("login")}
              variant="outline"
              className="w-full rounded-xl py-4 text-lg">
              Zaloguj się
            </Button>
          </div>

          <div className="text-center mt-4">
            <Button
              onClick={() => setCurrentView("home")}
              variant="ghost"
              className="text-sm text-text-muted hover:text-primary">
              ← Wróć do strony głównej
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
