import { useState } from "react";
import Head from "next/head";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function MobileLoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Nieprawidłowy email lub hasło");
      } else {
        toast.success("Zalogowano pomyślnie!");

        const response = await fetch("/api/auth/session");
        const session = await response.json();

        if (session?.user?.role === "ADMIN") {
          router.push("/mobile/admin");
        } else {
          router.push("/mobile/panel");
        }
      }
    } catch (error) {
      setError("Wystąpił błąd podczas logowania");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Logowanie - BREVA</title>
        <meta
          name="description"
          content="Zaloguj się do BREVA i rozpocznij analizę piersi z pomocą AI"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-accent-1 to-accent-2 flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Witaj z powrotem
            </h1>
            <p className="text-text-muted">
              Zaloguj się do swojego konta BREVA
            </p>
          </div>

          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Logowanie</CardTitle>
            </CardHeader>
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
                    className="rounded-xl"
                    required
                  />
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
            <p className="text-text-muted mb-4">Nie masz jeszcze konta?</p>
            <Link href="/mobile/rejestracja">
              <Button
                variant="outline"
                className="w-full rounded-xl py-4 text-lg">
                Utwórz konto
              </Button>
            </Link>
          </div>

          <div className="text-center mt-4">
            <Link
              href="/mobile"
              className="text-sm text-text-muted hover:text-primary">
              ← Wróć do strony głównej
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
