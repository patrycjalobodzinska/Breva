import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Measurement } from "@/types";
import {
  getAccuracyPercentage,
  getAccuracyBadgeVariant,
} from "@/utils/measurements";

interface AccuracyDisplayProps {
  measurement: Measurement;
}

export const AccuracyDisplay = ({ measurement }: AccuracyDisplayProps) => {
  if (!measurement?.manualItems || measurement?.manualItems.length === 0) {
    return null;
  }

  const manualMeasurement = measurement?.manualItems[0];
  const leftAccuracy = parseFloat(
    getAccuracyPercentage(
      measurement?.leftVolumeMl,
      manualmeasurement?.leftVolumeMl
    )
  );
  const rightAccuracy = parseFloat(
    getAccuracyPercentage(
      measurement?.rightVolumeMl,
      manualmeasurement?.rightVolumeMl
    )
  );
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-text-primary">
        Dokładność pomiaru
      </h2>
      <Card className="rounded-2xl p-6 bg-white/80">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-text-muted text-sm">Lewa pierś</p>
            <div className="rounded-full text-xl font-semibold ">
              {leftAccuracy.toFixed(1)}%
            </div>
          </div>
          <div>
            <p className="text-text-muted text-sm">Prawa pierś</p>
            <div className="rounded-full text-xl font-semibold ">
              {rightAccuracy.toFixed(2)}%
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
