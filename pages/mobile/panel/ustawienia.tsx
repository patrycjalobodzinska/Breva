import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import MobilePanelLayout from "@/components/layout/MobilePanelLayout";
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
import { User, Lock, Bell, Shield, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DeleteAccountModal } from "@/components/mobile/DeleteAccountModal";

export default function MobileSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Hasła nie są identyczne");
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Hasło musi mieć co najmniej 6 znaków");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/logowanie");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/logowanie");
    }
  };

  return (
    <MobilePanelLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Ustawienia
          </h1>
          <p className="text-text-muted">
            Zarządzaj swoim kontem i preferencjami
          </p>
        </div>

        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-lg">Informacje o użytkowniku</div>
                <CardDescription>Twoje podstawowe dane konta</CardDescription>
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
                <span className="font-medium text-text-primary">
                  {session?.user?.role === "ADMIN"
                    ? "Administrator"
                    : "Użytkownik"}
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
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  placeholder="Wprowadź nowe hasło"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Potwierdź nowe hasło"
                  className="rounded-xl"
                  required
                />
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

        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-lg text-red-600">Usuń konto</div>
                <CardDescription>
                  Trwale usuń swoje konto i wszystkie dane
                </CardDescription>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-text-muted">
                Ta akcja jest nieodwracalna. Wszystkie Twoje pomiary, pliki i
                dane zostaną trwale usunięte.
              </p>
              <Button
                onClick={() => setShowDeleteModal(true)}
                variant="outline"
                className="w-full rounded-xl text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Usuń konto
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </MobilePanelLayout>
  );
}
