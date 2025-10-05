import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import MobilePanelLayout from "@/components/layout/MobilePanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, X, Edit3 } from "lucide-react";
import { toast } from "sonner";

interface Measurement {
  id: string;
  name: string;
  note?: string;
  source: "AI" | "MANUAL";
  leftVolumeMl: number;
  rightVolumeMl: number;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
  manualItems?: {
    id: string;
    name: string;
    leftVolumeMl: number;
    rightVolumeMl: number;
    createdAt: string;
  }[];
}

export default function MobileMeasurementEditPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingManual, setIsEditingManual] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    note: "",
  });

  const [manualForm, setManualForm] = useState({
    name: "",
    leftVolumeMl: "",
    rightVolumeMl: "",
  });

  useEffect(() => {
    if (id) {
      fetchMeasurement();
    }
  }, [id]);

  const fetchMeasurement = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/measurements/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMeasurement(data);
        setEditForm({
          name: data.name,
          note: data.note || "",
        });
      } else {
        toast.error("Nie udało się pobrać pomiaru");
        router.push("/mobile/panel/pomiary");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas pobierania pomiaru");
      router.push("/mobile/panel/pomiary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!measurement) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/measurements/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast.success("Pomiar został zaktualizowany");
        router.push(`/mobile/panel/pomiary/${id}`);
      } else {
        toast.error("Nie udało się zaktualizować pomiaru");
      }
    } catch (error) {
      toast.error("Wystąpił błąd podczas aktualizacji pomiaru");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveManual = async () => {
    if (!measurement) return;

    try {
      setIsSaving(true);
      const hasManual =
        measurement.manualItems && measurement.manualItems.length > 0;

      if (hasManual && measurement.manualItems) {
        // Edytuj istniejący pomiar ręczny
        const manualId = measurement.manualItems[0].id;
        const response = await fetch(`/api/measurements/manual/${manualId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: manualForm.name,
            leftVolumeMl: parseFloat(manualForm.leftVolumeMl),
            rightVolumeMl: parseFloat(manualForm.rightVolumeMl),
          }),
        });

        if (response.ok) {
          toast.success("Pomiar ręczny został zaktualizowany");
        } else {
          toast.error("Nie udało się zaktualizować pomiaru ręcznego");
        }
      } else {
        // Dodaj nowy pomiar ręczny
        const response = await fetch(`/api/measurements/${id}/manual`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: manualForm.name,
            leftVolumeMl: parseFloat(manualForm.leftVolumeMl),
            rightVolumeMl: parseFloat(manualForm.rightVolumeMl),
          }),
        });

        if (response.ok) {
          toast.success("Pomiar ręczny został dodany");
        } else {
          toast.error("Nie udało się dodać pomiaru ręcznego");
        }
      }

      setManualForm({ name: "", leftVolumeMl: "", rightVolumeMl: "" });
      setIsEditingManual(false);
      fetchMeasurement();
    } catch (error) {
      toast.error("Wystąpił błąd podczas zapisywania pomiaru ręcznego");
    } finally {
      setIsSaving(false);
    }
  };

  const startEditManual = () => {
    if (measurement?.manualItems && measurement.manualItems.length > 0) {
      const manual = measurement.manualItems[0];
      setManualForm({
        name: manual.name,
        leftVolumeMl: manual.leftVolumeMl.toString(),
        rightVolumeMl: manual.rightVolumeMl.toString(),
      });
    } else {
      setManualForm({ name: "", leftVolumeMl: "", rightVolumeMl: "" });
    }
    setIsEditingManual(true);
  };

  if (isLoading) {
    return (
      <MobilePanelLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-muted">Ładowanie pomiaru...</p>
          </div>
        </div>
      </MobilePanelLayout>
    );
  }

  if (!measurement) {
    return (
      <MobilePanelLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Pomiar nie został znaleziony
            </h3>
            <Button
              onClick={() => router.push("/mobile/panel/pomiary")}
              className="rounded-xl">
              Wróć do listy pomiarów
            </Button>
          </div>
        </div>
      </MobilePanelLayout>
    );
  }

  return (
    <MobilePanelLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Wróć
          </Button>
          <Button
            onClick={handleSaveEdit}
            disabled={isSaving}
            className="rounded-xl">
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Zapisywanie...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Zapisz
              </>
            )}
          </Button>
        </div>

        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Edit3 className="h-5 w-5 mr-2" />
              Edycja pomiaru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa pomiaru</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="Nazwa pomiaru"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Notatka</Label>
              <Textarea
                id="note"
                value={editForm.note}
                onChange={(e) =>
                  setEditForm({ ...editForm, note: e.target.value })
                }
                placeholder="Dodatkowe informacje o pomiarze..."
                className="rounded-xl"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-text-primary">
                  {measurement.leftVolumeMl.toFixed(1)}ml
                </div>
                <div className="text-sm text-text-muted">Lewa pierś</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-text-primary">
                  {measurement.rightVolumeMl.toFixed(1)}ml
                </div>
                <div className="text-sm text-text-muted">Prawa pierś</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Edit3 className="h-5 w-5 mr-2" />
                Pomiar ręczny
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={startEditManual}
                className="rounded-xl">
                <Edit3 className="h-4 w-4 mr-2" />
                {measurement.manualItems && measurement.manualItems.length > 0
                  ? "Edytuj"
                  : "Dodaj"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditingManual && (
              <div className="space-y-4 mb-4 p-4 bg-blue-50 rounded-xl">
                <div className="space-y-2">
                  <Label htmlFor="manualName">Nazwa pomiaru ręcznego</Label>
                  <Input
                    id="manualName"
                    value={manualForm.name}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, name: e.target.value })
                    }
                    placeholder="Nazwa pomiaru"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="manualLeft">Lewa pierś (ml)</Label>
                    <Input
                      id="manualLeft"
                      type="number"
                      step="0.1"
                      value={manualForm.leftVolumeMl}
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          leftVolumeMl: e.target.value,
                        })
                      }
                      placeholder="0.0"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manualRight">Prawa pierś (ml)</Label>
                    <Input
                      id="manualRight"
                      type="number"
                      step="0.1"
                      value={manualForm.rightVolumeMl}
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          rightVolumeMl: e.target.value,
                        })
                      }
                      placeholder="0.0"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveManual}
                    disabled={isSaving}
                    className="flex-1 rounded-xl">
                    {isSaving ? "Zapisywanie..." : "Zapisz"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingManual(false);
                      setManualForm({
                        name: "",
                        leftVolumeMl: "",
                        rightVolumeMl: "",
                      });
                    }}
                    className="rounded-xl">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {measurement.manualItems && measurement.manualItems.length > 0 ? (
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-text-primary">
                      {measurement.manualItems[0].name}
                    </div>
                    <div className="text-sm text-text-muted">
                      {measurement.manualItems[0].leftVolumeMl.toFixed(1)}ml /{" "}
                      {measurement.manualItems[0].rightVolumeMl.toFixed(1)}ml
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-text-muted mb-4">
                  Brak pomiaru ręcznego
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MobilePanelLayout>
  );
}
