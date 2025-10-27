"use client";

import { useRouter } from "next/router";
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
  } = useMeasurementDetail(router.query.id as string);

  const isAdmin = session?.user?.role === "ADMIN";
  const Layout = isAdmin ? AdminLayout : PanelLayout;

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

  const hasManualMeasurement =
    measurement?.manualItems && measurement?.manualItems.length > 0;
  const manualMeasurement = hasManualMeasurement
    ? measurement?.manualItems![0]
    : null;

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
            hasManualMeasurement={hasManualMeasurement}
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
        {measurement?.source === "AI" && (
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
                  {measurement?.leftVolumeMl} ml
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
                  {measurement?.rightVolumeMl} ml
                </p>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Manual Measurements */}
        {hasManualMeasurement && (
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
                      <p className="text-xl font-semibold text-text-primary">
                        {manualMeasurement?.leftVolumeMl} ml
                      </p>
                    </div>
                    <div>
                      <p className="text-text-muted text-sm">
                        Prawa pierś (ml)
                      </p>
                      <p className="text-xl font-semibold text-text-primary">
                        {manualMeasurement?.rightVolumeMl} ml
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* {measurement?.source === "AI" && hasManualMeasurement && (
              <AccuracyDisplay measurement={measurement} />
            )}{" "} */}
          </div>
        )}
        <MeasurementChart
          data={prepareChartData(measurement)}
          title="Porównanie AI vs Pomiary ręczne"
          description="Wykres porównujący wyniki AI z pomiarami ręcznymi"
        />
        {/* Accuracy */}
        {/* Note */}
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
