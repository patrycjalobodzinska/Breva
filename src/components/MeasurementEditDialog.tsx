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
import { Textarea } from "@/components/ui/textarea";
import { MeasurementFormData } from "@/types";

interface MeasurementEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: MeasurementFormData;
  onFormChange: (data: MeasurementFormData) => void;
  onSave: (e: React.FormEvent) => void;
  title: string;
  description: string;
}

export const MeasurementEditDialog = ({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onSave,
  title,
  description,
}: MeasurementEditDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <Label htmlFor="name">Nazwa</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                onFormChange({ ...formData, name: e.target.value })
              }
              placeholder="Nazwa pomiaru"
              className="rounded-2xl"
              required
            />
          </div>
          <div>
            <Label htmlFor="note">Notatka (opcjonalna)</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) =>
                onFormChange({ ...formData, note: e.target.value })
              }
              placeholder="Dodatkowe informacje..."
              className="rounded-2xl"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button
              type="submit"
              className="rounded-2xl bg-primary hover:bg-primary-dark">
              Zapisz zmiany
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
