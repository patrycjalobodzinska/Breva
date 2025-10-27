import { Measurement, ChartData, MeasurementStats } from "@/types";

export const getAsymmetryPercentage = (left: number, right: number): string => {
  const total = left + right;
  const difference = Math.abs(left - right);
  return ((difference / total) * 100).toFixed(1);
};

/**
 * Oblicza błąd absolutny, błąd procentowy i dokładność dla dwóch wartości.
 *
 * @param {number} prawdziwyWynik - Rzeczywista wartość (True Value).
 * @param {number} wynikAI - Wartość przewidziana przez model AI (Predicted Value).
 * @returns {{
 * bladAbsolutny: number,
 * bladProcentowy: number,
 * dokladnosc: number
 * }} Obiekt z metrykami.
 */
export const obliczDokladnosc = (prawdziwyWynik: number, wynikAI: number) => {
  // Sprawdzenie dzielenia przez zero i niepoprawnych danych
  if (
    typeof prawdziwyWynik !== "number" ||
    typeof wynikAI !== "number" ||
    prawdziwyWynik === 0
  ) {
    // W przypadku błędu zwracamy null lub rzucamy wyjątek.
    // Tutaj zwracamy bezpieczne wartości dla przejrzystości.
    return {
      bladAbsolutny: NaN,
      bladProcentowy: NaN,
      dokladnosc: NaN,
    };
  }

  // 1. Błąd Absolutny
  const bladAbsolutny = Math.abs(prawdziwyWynik - wynikAI);

  // 2. Błąd Procentowy
  const bladProcentowy = (bladAbsolutny / prawdziwyWynik) * 100;

  // 3. Dokładność (Accuracy)
  const dokladnosc = 100 - bladProcentowy;

  // Zwracanie wyników z zaokrągleniem do 2 miejsc po przecinku
  return {
    bladAbsolutny: Number(bladAbsolutny.toFixed(2)),
    bladProcentowy: Number(bladProcentowy.toFixed(2)),
    dokladnosc: Number(dokladnosc.toFixed(2)),
  };
};

export const getAccuracyPercentage = (ai: number, manual: number): string => {
  // AI to "prawdziwy wynik" (ground truth), manual to "wynik do porównania"
  const result = obliczDokladnosc(manual, ai);
  return result.dokladnosc.toFixed(1);
};

export const prepareChartData = (measurement: Measurement): ChartData[] => {
  if (!measurement) return [];

  const data: ChartData[] = [];

  // Jeśli to pomiar AI, dodaj go jako "AI"
  if (measurement?.source === "AI") {
    data.push({
      name: "AI",
      left: measurement?.leftVolumeMl,
      right: measurement?.rightVolumeMl,
      date: new Date(measurement?.createdAt).toLocaleDateString("pl-PL"),
    });
  }

  // Jeśli to pomiar ręczny, dodaj go jako "Ręczny"
  if (measurement?.source === "MANUAL") {
    data.push({
      name: "Ręczny",
      left: measurement?.leftVolumeMl,
      right: measurement?.rightVolumeMl,
      date: new Date(measurement?.createdAt).toLocaleDateString("pl-PL"),
    });
  }

  // Dodaj dodatkowe pomiary ręczne jeśli istnieją
  if (measurement?.manualItems) {
    measurement?.manualItems.forEach((item) => {
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
    measurement?.leftVolumeMl,
    measurement?.rightVolumeMl
  );

  let accuracy;
  if (measurement?.manualItems && measurement?.manualItems.length > 0) {
    const manualMeasurement = measurement?.manualItems[0];
    accuracy = {
      left: getAccuracyPercentage(
        measurement?.leftVolumeMl,
        manualmeasurement?.leftVolumeMl
      ),
      right: getAccuracyPercentage(
        measurement?.rightVolumeMl,
        manualmeasurement?.rightVolumeMl
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
