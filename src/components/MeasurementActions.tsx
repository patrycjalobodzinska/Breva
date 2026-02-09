import React from "react";
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
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <Button
        type="button"
        variant="outline"
        onClick={handleEdit}
        className="rounded-2xl">
        <Edit className="h-5 w-5 " />
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={handleDelete}
        disabled={!onDelete}
        className="rounded-2xl text-destructive hover:bg-destructive/10">
        <Trash2 className="h-5 w-5 " />
      </Button>
    </div>
  );
};
