import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Measurement } from "@/types";

interface MeasurementActionsProps {
  measurement: Measurement;
  onEdit: () => void;
  onDelete: () => void;
  onEditManual?: () => void;
  onAddManual?: () => void;
  hasManualMeasurement?: boolean;
}

export const MeasurementActions = ({
  measurement,
  onEdit,
  onDelete,
  onEditManual,
  onAddManual,
  hasManualMeasurement = false,
}: MeasurementActionsProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" onClick={onEdit} className="rounded-2xl">
        <Edit className="h-4 w-4 mr-2" />
        Edytuj
      </Button>

      <Button
        variant="outline"
        onClick={onDelete}
        className="rounded-2xl text-destructive hover:bg-destructive/10">
        <Trash2 className="h-4 w-4 mr-2" />
        Usuń
      </Button>

      <div>
        {measurement?.manualAnalysis ? (
          <Button
            onClick={onEditManual}
            className="rounded-2xl bg-primary hover:bg-primary-dark">
            <Edit className="h-4 w-4 mr-2" />
            Edytuj pomiar ręczny
          </Button>
        ) : (
          <Button
            onClick={onAddManual}
            className="rounded-2xl bg-primary hover:bg-primary-dark">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj pomiar ręczny
          </Button>
        )}
      </div>
    </div>
  );
};
