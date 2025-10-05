import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import { Measurement } from "@/types";
import { getAsymmetryPercentage } from "@/utils/measurements";

interface MeasurementCardProps {
  measurement: Measurement;
  title: string;
  subtitle?: string;
}

export const MeasurementCard = ({
  measurement,
  title,
  subtitle,
}: MeasurementCardProps) => {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
        {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold text-text-primary mb-2">
          {measurement.leftVolumeMl} ml
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">
            Asymetria:{" "}
            {getAsymmetryPercentage(
              measurement.leftVolumeMl,
              measurement.rightVolumeMl
            )}
            %
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
