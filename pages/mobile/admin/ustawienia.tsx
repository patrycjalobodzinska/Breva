import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import MobileAdminLayout from "@/components/layout/MobileAdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, LogOut, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/lib/validations";

export default function MobileAdminSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});

    try {
      const validatedData = changePasswordSchema.parse(formData);

      try {
        const response = await fetch("/api/user/password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validatedData),
        });

        if (response.ok) {
          toast.success("Hasło zostało zmienione pomyślnie");
          setFormData({ newPassword: "", confirmPassword: "" });
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Wystąpił błąd podczas zmiany hasła");
        }
      } catch (error) {
        console.error("Password change error:", error);
        toast.error("Wystąpił błąd podczas zmiany hasła");
      }
    } catch (validationError: any) {
      if (validationError.issues) {
        const errors: Record<string, string> = {};
        validationError.issues.forEach((err: any) => {
          if (err.path && err.path.length > 0) {
            errors[err.path[0]] = err.message;
          }
        });
        setFormErrors(errors);
      } else {
        toast.error("Wystąpił błąd walidacji formularza");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/mobile");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/mobile");
    }
  };

  return (
    <MobileAdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Ustawienia
          </h1>
          <p className="text-text-muted text-sm">
            Zarządzaj swoim kontem administratora
          </p>
        </div>

        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-lg">Administrator</div>
                <CardDescription>
                  Informacje o koncie administratora
                </CardDescription>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-text-muted">Email</span>
                <span className="font-medium text-text-primary">
                  {session?.user?.email}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-text-muted">Imię</span>
                <span className="font-medium text-text-primary">
                  {session?.user?.name || "Brak"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-text-muted">Rola</span>
                <span className="font-medium text-amber-600 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Administrator
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-lg">Zmień hasło</div>
                <CardDescription>
                  Zaktualizuj swoje hasło do konta
                </CardDescription>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nowe hasło</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    placeholder="Wprowadź nowe hasło"
                    className={`rounded-xl pr-10 ${
                      formErrors.newPassword ? "border-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary">
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formErrors.newPassword && (
                  <p className="text-red-500 text-xs">
                    {formErrors.newPassword}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
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
                    placeholder="Potwierdź nowe hasło"
                    className={`rounded-xl pr-10 ${
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
                  <p className="text-red-500 text-xs">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl"
                disabled={isLoading}>
                {isLoading ? "Zmienianie..." : "Zmień hasło"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-lg">Wylogowanie</div>
                <CardDescription>
                  Zakończ sesję i wróć do strony głównej
                </CardDescription>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full rounded-xl text-red-600 border-red-200 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" />
              Wyloguj się
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileAdminLayout>
  );
}
