import { Measurement, ChartData, MeasurementStats } from "@/types";

export const getAsymmetryPercentage = (left: number, right: number): string => {
  const total = left + right;
  const difference = Math.abs(left - right);
  return ((difference / total) * 100).toFixed(1);
};

export const getAccuracyPercentage = (ai: number, manual: number): string => {
  const accuracy = 100 - (Math.abs(manual - ai) / ai) * 100;
  return Math.max(0, accuracy).toFixed(1);
};

export const prepareChartData = (measurement: Measurement): ChartData[] => {
  if (!measurement) return [];

  const data: ChartData[] = [
    {
      name: "AI",
      left: measurement.leftVolumeMl,
      right: measurement.rightVolumeMl,
      date: new Date(measurement.createdAt).toLocaleDateString("pl-PL"),
    },
  ];

  if (measurement.manualItems) {
    measurement.manualItems.forEach((item) => {
      data.push({
        name: item.name || "Ręczny",
        left: item.leftVolumeMl,
        right: item.rightVolumeMl,
        date: new Date(item.createdAt).toLocaleDateString("pl-PL"),
      });
    });
  }
  return data;
};

export const getMeasurementStats = (
  measurement: Measurement
): MeasurementStats => {
  const asymmetry = getAsymmetryPercentage(
    measurement.leftVolumeMl,
    measurement.rightVolumeMl
  );

  let accuracy;
  if (measurement.manualItems && measurement.manualItems.length > 0) {
    const manualMeasurement = measurement.manualItems[0];
    accuracy = {
      left: getAccuracyPercentage(
        measurement.leftVolumeMl,
        manualMeasurement.leftVolumeMl
      ),
      right: getAccuracyPercentage(
        measurement.rightVolumeMl,
        manualMeasurement.rightVolumeMl
      ),
    };
  }

  return {
    asymmetry,
    accuracy,
  };
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("pl-PL");
};

export const getBadgeVariant = (source: "AI" | "MANUAL") => {
  return source === "AI" ? "default" : "secondary";
};

export const getAccuracyBadgeVariant = (accuracy: number) => {
  if (accuracy >= 95) return "success";
  if (accuracy >= 90) return "warning";
  return "destructive";
};
