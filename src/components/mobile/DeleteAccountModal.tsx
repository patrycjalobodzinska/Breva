"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal = ({
  isOpen,
  onClose,
}: DeleteAccountModalProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const [password, setPassword] = useState("");

  const requiredText = "USUŃ KONTO";

  const handleDelete = async () => {
    if (confirmationText !== requiredText) {
      setError("Wpisz dokładnie: USUŃ KONTO");
      return;
    }

    if (!password) {
      setError("Wprowadź hasło");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: password,
        }),
      });

      if (response.ok) {
        toast.success("Konto zostało usunięte pomyślnie");

        // Wyloguj użytkownika
        await signOut({ redirect: false });

        // Przekieruj na stronę główną
        router.push("/");
      } else {
        const data = await response.json();
        setError(data.error || "Wystąpił błąd podczas usuwania konta");
      }
    } catch (error) {
      setError("Wystąpił błąd podczas usuwania konta");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-red-600">
            Usuń konto
          </CardTitle>
          <p className="text-sm text-text-muted mt-2">
            Ta akcja jest nieodwracalna. Wszystkie Twoje dane zostaną trwale
            usunięte.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Wpisz <span className="font-bold text-red-600">USUŃ KONTO</span>{" "}
              aby potwierdzić:
            </Label>
            <Input
              id="confirmation"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="USUŃ KONTO"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wprowadź hasło"
              className="rounded-xl"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-xl py-3">
              Anuluj
            </Button>
            <Button
              onClick={handleDelete}
              disabled={
                isLoading || confirmationText !== requiredText || !password
              }
              className="flex-1 rounded-xl py-3 bg-red-600 hover:bg-red-700 text-white">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Usuwanie...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Usuń konto
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
