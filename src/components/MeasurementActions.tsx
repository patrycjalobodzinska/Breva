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
}

export const MeasurementActions = ({
  measurement,
  onEdit,
  onDelete,
  onEditManual,
  onAddManual,
}: MeasurementActionsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" onClick={onEdit} className="rounded-2xl">
        <Edit className="h-5 w-5 " />
      </Button>

      <Button
        variant="outline"
        onClick={onDelete}
        className="rounded-2xl text-destructive hover:bg-destructive/10">
        <Trash2 className="h-5 w-5 " />
      </Button>
    </div>
  );
};
