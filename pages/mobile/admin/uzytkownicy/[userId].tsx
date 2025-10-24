"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Key, BarChart3, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";

interface User {
  id: string;
  email: string;
  name?: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

interface Measurement {
  id: string;
  name: string;
  note?: string;
  source: "AI" | "MANUAL";
  leftVolumeMl: number;
  rightVolumeMl: number;
  createdAt: string;
}

export default function UserDetailPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (router.query.userId) {
      fetchUser();
      fetchUserMeasurements();
    }
  }, [router.query.userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${router.query.userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        router.push("/admin/uzytkownicy");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      router.push("/admin/uzytkownicy");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserMeasurements = async () => {
    try {
      const response = await fetch(
        `/api/admin/users/${router.query.userId}/measurements`
      );
      if (response.ok) {
        const data = await response.json();
        setMeasurements(data);
      }
    } catch (error) {
      console.error("Error fetching user measurements:", error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Hasło musi mieć co najmniej 6 znaków");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch(
        `/api/admin/users/${router.query.userId}/password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPassword,
          }),
        }
      );

      if (response.ok) {
        toast.success("Hasło zostało zmienione pomyślnie");
        setNewPassword("");
      } else {
        const error = await response.json();
        toast.error(error.error || "Wystąpił błąd podczas zmiany hasła");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas zmiany hasła");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAsymmetryPercentage = (left: number, right: number) => {
    const total = left + right;
    const difference = Math.abs(left - right);
    return ((difference / total) * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="rounded-2xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Wróć
            </Button>
          </div>
          <Card className="rounded-2xl">
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <p className="text-text-muted">
                Ładowanie szczegółów użytkownika...
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="rounded-2xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Wróć
            </Button>
          </div>
          <Card className="rounded-2xl">
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">
                Użytkownik nie został znaleziony
              </h3>
              <p className="text-text-muted">
                Ten użytkownik może nie istnieć.
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="rounded-2xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Wróć
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                {user.name || "Brak imienia"}
              </h1>
              <p className="text-text-muted">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant={user.role === "ADMIN" ? "destructive" : "default"}
              className="rounded-full">
              {user.role === "ADMIN" ? "Admin" : "Użytkownik"}
            </Badge>
          </div>
        </div>

        {/* User Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <span>Informacje o użytkowniku</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-text-muted">{user.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Imię</Label>
                <p className="text-text-muted">
                  {user.name || "Nie ustawiono"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Rola</Label>
                <p className="text-text-muted">
                  {user.role === "ADMIN" ? "Administrator" : "Użytkownik"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Data rejestracji</Label>
                <p className="text-text-muted">{formatDate(user.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-primary" />
                <span>Zarządzanie hasłem</span>
              </CardTitle>
              <CardDescription>Zmień hasło użytkownika</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">Nowe hasło</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Wprowadź nowe hasło"
                    required
                    minLength={6}
                    className="rounded-2xl"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full rounded-2xl bg-primary hover:bg-primary-dark">
                  {isChangingPassword ? "Zmienianie..." : "Zmień hasło"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* User Measurements */}
        <Card className="bg-white rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Pomiary użytkownika ({measurements.length})</span>
            </CardTitle>
            <CardDescription>
              Lista wszystkich pomiarów tego użytkownika
            </CardDescription>
          </CardHeader>
          <CardContent>
            {measurements.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Brak pomiarów</h3>
                <p className="text-text-muted">
                  Ten użytkownik nie ma jeszcze żadnych pomiarów
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {measurements.map((measurement) => (
                  <div
                    key={measurement.id}
                    className="border border-primary/20 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{measurement.name}</h4>
                        {measurement.note && (
                          <p className="text-sm text-text-muted">
                            {measurement.note}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-text-muted">
                          {formatDate(measurement.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-text-muted">Lewa pierś</p>
                        <p className="font-medium">
                          {measurement.leftVolumeMl.toFixed(1)} ml
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">Prawa pierś</p>
                        <p className="font-medium">
                          {measurement.rightVolumeMl.toFixed(1)} ml
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">Asymetria</p>
                        <p className="font-medium">
                          {getAsymmetryPercentage(
                            measurement.leftVolumeMl,
                            measurement.rightVolumeMl
                          )}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
