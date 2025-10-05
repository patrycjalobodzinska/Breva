import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EditManualFormData, ManualMeasurementFormData } from "@/types";

interface ManualMeasurementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  onFormChange: (data: any) => void;
  onSave: (e: React.FormEvent) => void;
  title: string;
  description: string;
  isEdit?: boolean;
}

export const ManualMeasurementDialog = ({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onSave,
  title,
  description,
  isEdit = false,
}: ManualMeasurementDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="leftVolume">Lewa pierś (ml)</Label>
              <Input
                id="leftVolume"
                type="number"
                step="0.1"
                value={formData.leftVolumeMl}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    leftVolumeMl: e.target.value,
                  })
                }
                placeholder="np. 350.25"
                className="rounded-2xl"
                required
              />
            </div>
            <div>
              <Label htmlFor="rightVolume">Prawa pierś (ml)</Label>
              <Input
                id="rightVolume"
                type="number"
                step="0.1"
                value={formData.rightVolumeMl}
                onChange={(e) =>
                  onFormChange({
                    ...formData,
                    rightVolumeMl: e.target.value,
                  })
                }
                placeholder="np. 348.10"
                className="rounded-2xl"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button
              type="submit"
              className="rounded-2xl bg-primary hover:bg-primary-dark">
              {isEdit ? "Zapisz zmiany" : "Dodaj pomiar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
