"use client";

import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, Target, TrendingUp } from "lucide-react";
import PanelLayout from "@/components/PanelLayout";
import AdminLayout from "@/components/AdminLayout";
import { useSession } from "next-auth/react";
import { useMeasurementDetail } from "@/hooks/useMeasurementDetail";
import { MeasurementEditDialog } from "@/components/MeasurementEditDialog";
import { ManualMeasurementDialog } from "@/components/ManualMeasurementDialog";
import { MeasurementActions } from "@/components/MeasurementActions";
import { AccuracyDisplay } from "@/components/AccuracyDisplay";
import { MeasurementChart } from "@/components/MeasurementChart";
import {
  prepareChartData,
  getAsymmetryPercentage,
  getBadgeVariant,
} from "@/utils/measurements";

export default function MeasurementDetailPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const {
    measurement,
    isLoading,
    isEditing,
    isEditingManual,
    isAddingManual,
    editForm,
    editManualForm,
    manualForm,
    setEditForm,
    setEditManualForm,
    setManualForm,
    setIsEditing,
    setIsEditingManual,
    setIsAddingManual,
    handleEdit,
    handleSaveEdit,
    handleEditManual,
    handleSaveEditManual,
    handleAddManual,
    handleDelete,
    fetchMeasurement,
  } = useMeasurementDetail(router.query.id as string);

  const isAdmin = session?.user?.role === "ADMIN";
  const Layout = isAdmin ? AdminLayout : PanelLayout;

  const [leftStatus, setLeftStatus] = useState<string | null>(null);
  const [rightStatus, setRightStatus] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const fetchStatuses = useCallback(async () => {
    const mid = router.query.id as string;
    if (!mid) return;

    const previousLeftStatus = leftStatus;
    const previousRightStatus = rightStatus;

    let newLeftStatus: string | null = null;
    let newRightStatus: string | null = null;
    let leftCompleted = false;
    let rightCompleted = false;

    try {
      const l = await fetch(
        `/api/lidar-capture/status?measurementId=${encodeURIComponent(mid)}&side=left`,
        { cache: "no-store" }
      );
      if (l.ok) {
        const d = await l.json();
        newLeftStatus = d.status;
        setLeftStatus(d.status);
        if (d.status === "COMPLETED" && previousLeftStatus !== "COMPLETED") {
          leftCompleted = true;
        }
      } else if (l.status === 404) {
        setLeftStatus(null);
      }
    } catch {}

    try {
      const r = await fetch(
        `/api/lidar-capture/status?measurementId=${encodeURIComponent(mid)}&side=right`,
        { cache: "no-store" }
      );
      if (r.ok) {
        const d = await r.json();
        newRightStatus = d.status;
        setRightStatus(d.status);
        if (d.status === "COMPLETED" && previousRightStatus !== "COMPLETED") {
          rightCompleted = true;
        }
      } else if (r.status === 404) {
        setRightStatus(null);
      }
    } catch {}

    const shouldPoll = newLeftStatus === "PENDING" || newRightStatus === "PENDING";
    setIsPolling(shouldPoll);

    if (leftCompleted || rightCompleted) {
      queryClient.invalidateQueries({ queryKey: ["measurement", mid] });
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
      await fetchMeasurement(true);
    }
  }, [leftStatus, rightStatus, router.query.id, queryClient, fetchMeasurement]);

  // Invaliduj cache React Query przy wejściu w widok
  useEffect(() => {
    const id = router.query.id as string;
    if (id) {
      queryClient.invalidateQueries({ queryKey: ["measurement", id] });
      queryClient.invalidateQueries({ queryKey: ["measurements"] });
      fetchStatuses();
    }
  }, [router.query.id, queryClient, fetchStatuses]);

  useEffect(() => {
    if (!isPolling || !router.query.id) return;
    const t = setInterval(() => {
      fetchStatuses();
    }, 5000);
    return () => clearInterval(t);
  }, [isPolling, router.query.id, fetchStatuses]);

  if (isLoading) {
    return (
      <Layout>
        <Card white className="rounded-2xl">
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-text-muted">Ładowanie pomiaru...</p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (!measurement) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
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
                Pomiar nie został znaleziony
              </h3>
              <p className="text-text-muted">
                Ten pomiar może nie istnieć lub nie masz do niego dostępu.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}{" "}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="rounded-2xl">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Wróć
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-text-primary">
              {measurement?.name}
            </h1>
          </div>
          <MeasurementActions
            measurement={measurement}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onEditManual={handleEditManual}
            onAddManual={() => setIsAddingManual(true)}
          />
        </div>
        {/* Edit Dialog */}
        <MeasurementEditDialog
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          formData={editForm}
          onFormChange={setEditForm}
          onSave={handleSaveEdit}
          title="Edytuj pomiar"
          description="Zmień nazwę i notatkę pomiaru"
        />
        {/* Edit Manual Dialog */}
        <ManualMeasurementDialog
          isOpen={isEditingManual}
          onClose={() => setIsEditingManual(false)}
          formData={editManualForm}
          onFormChange={setEditManualForm}
          onSave={handleSaveEditManual}
          title="Edytuj pomiar ręczny"
          description="Zmień wartości objętości pomiaru ręcznego"
          isEdit={true}
        />
        {/* Add Manual Dialog */}
        <ManualMeasurementDialog
          isOpen={isAddingManual}
          onClose={() => setIsAddingManual(false)}
          formData={manualForm}
          onFormChange={(data) => setManualForm(data)}
          onSave={handleAddManual}
          title="Dodaj pomiar ręczny"
          description="Porównaj swój pomiar z wynikiem AI"
          isEdit={false}
        />
        {/* AI Results */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card white>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Lewa pierś (AI)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-text-primary">
                {measurement?.aiAnalysis?.leftVolumeMl
                  ? measurement?.aiAnalysis?.leftVolumeMl?.toFixed(1) + " ml"
                  : "-"}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Prawa pierś (AI)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-text-primary">
                {measurement?.aiAnalysis?.rightVolumeMl
                  ? measurement?.aiAnalysis?.rightVolumeMl?.toFixed(1) + " ml"
                  : "-"}
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Manual Measurements */}
        <div className="space-y-4 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-text-primary">
              Pomiar ręczny
            </h2>
            <Card className="rounded-2xl bg-white/80">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-text-muted text-sm">Lewa pierś (ml)</p>
                    <p className="text-5xl font-bold text-text-primary">
                      {measurement?.manualAnalysis?.leftVolumeMl
                        ? measurement?.manualAnalysis?.leftVolumeMl?.toFixed(
                            1
                          ) + " ml"
                        : "-"}
                      manualAnalysis
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-sm">Prawa pierś (ml)</p>
                    <p className="text-5xl font-bold text-text-primary">
                      {measurement?.manualAnalysis?.rightVolumeMl
                        ? measurement?.manualAnalysis?.rightVolumeMl?.toFixed(
                            1
                          ) + " ml"
                        : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <MeasurementChart
          data={prepareChartData(measurement)}
          title="Porównanie AI vs Pomiary ręczne"
          description="Wykres porównujący wyniki AI z pomiarami ręcznymi"
        />
        {measurement?.note && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-text-primary">Notatka</h2>
            <Card className="rounded-2xl p-6 bg-white/80">
              <p className="text-text-muted">{measurement?.note}</p>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
