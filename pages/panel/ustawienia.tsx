"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Lock, User, Mail, Eye, EyeOff } from "lucide-react";
import PanelLayout from "@/components/PanelLayout";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Hasła nie są identyczne");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Hasło musi mieć co najmniej 6 znaków");
      return;
    }

    try {
      setIsLoading(true);
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
        const error = await response.json();
        toast.error(error.error || "Wystąpił błąd podczas zmiany hasła");
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error("Wystąpił błąd podczas zmiany hasła");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-text-primary">Ustawienia</h1>
        </div>

        <div className="grid gap-6">
          {/* User Info */}
          <Card white className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informacje o użytkowniku</span>
              </CardTitle>
              <CardDescription>Twoje podstawowe dane konta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-muted">Email:</span>
                <span className="font-medium">{session?.user?.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-text-muted" />
                <span className="text-sm text-text-muted">Imię:</span>
                <span className="font-medium">
                  {session?.user?.name || "Brak"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card white className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Zmiana hasła</span>
              </CardTitle>
              <CardDescription>
                Zmień swoje hasło na nowe, bezpieczne hasło
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      required
                      className="pr-10"
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
                      placeholder="Potwierdź nowe hasło"
                      required
                      className="pr-10"
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
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-2xl bg-primary hover:bg-primary-dark">
                  {isLoading ? "Zmienianie..." : "Zmień hasło"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PanelLayout>
  );
}
