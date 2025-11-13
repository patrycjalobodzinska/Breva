import { useCallback, useEffect, useRef, useState } from "react";

type MeasurementValueState =
  | "loading"
  | "pending"
  | "value"
  | "failed"
  | "empty"
  | "error";

export interface MeasurementValueResult {
  state: MeasurementValueState;
  value: number | null;
  lastStatus: string | null;
  error: string | null;
  isLoading: boolean;
  refresh: () => void;
}

const POLL_INTERVAL_MS = 3000;

export function useMeasurementValue(
  measurementId: string | undefined | null,
  side: "left" | "right"
): MeasurementValueResult {
  const [state, setState] = useState<MeasurementValueState>("loading");
  const [value, setValue] = useState<number | null>(null);
  const [lastStatus, setLastStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchDataRef = useRef<() => Promise<void>>();

  const stopPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const scheduleNextCheck = useCallback(
    (delay = POLL_INTERVAL_MS) => {
      stopPolling();
      pollTimeoutRef.current = setTimeout(() => {
        fetchDataRef.current?.();
      }, delay);
    },
    [stopPolling]
  );

  const fetchData = useCallback(async () => {
    if (!measurementId) {
      setState("empty");
      setValue(null);
      setLastStatus(null);
      stopPolling();
      return;
    }

    setError(null);
    setState("loading");

    try {
      const measurementResponse = await fetch(
        `/api/measurements/${measurementId}?t=${Date.now()}`,
        {
          cache: "no-store",
        }
      );

      if (measurementResponse.ok) {
        const measurementData = await measurementResponse.json();
        const volumeKey =
          side === "left" ? "leftVolumeMl" : "rightVolumeMl";
        const measuredValue = measurementData?.aiAnalysis?.[volumeKey];

        if (
          typeof measuredValue === "number" &&
          Number.isFinite(measuredValue)
        ) {
          setValue(measuredValue);
          setState("value");
          setLastStatus("COMPLETED");
          stopPolling();
          return;
        }
      } else if (measurementResponse.status === 404) {
        setValue(null);
        setState("empty");
        setLastStatus("NOT_FOUND");
        stopPolling();
        return;
      } else {
        throw new Error(
          `Nie udało się pobrać pomiaru (${measurementResponse.status})`
        );
      }
    } catch (err) {
      console.error("❌ [useMeasurementValue] Błąd pobierania pomiaru:", err);
      setError("Nie udało się pobrać danych pomiaru.");
      setState("error");
      setLastStatus("ERROR");
      stopPolling();
      return;
    }

    // Jeśli nie ma wartości, sprawdź status LiDAR
    try {
      const statusResponse = await fetch(
        `/api/lidar-capture/status?measurementId=${encodeURIComponent(
          measurementId
        )}&side=${side}&t=${Date.now()}`,
        {
          cache: "no-store",
        }
      );

      if (statusResponse.status === 404) {
        setState("empty");
        setValue(null);
        setLastStatus("NOT_FOUND");
        stopPolling();
        return;
      }

      if (!statusResponse.ok) {
        throw new Error(
          `Nie udało się pobrać statusu (${statusResponse.status})`
        );
      }

      const statusData = await statusResponse.json();
      console.log(
        "📡 [useMeasurementValue] Odpowiedź statusu z backendu:",
        statusData
      );
      const status = (statusData.status || "").toUpperCase();
      setLastStatus(status || null);

      if (status === "FAILED") {
        setState("failed");
        setValue(null);
        stopPolling();
        return;
      }

      if (status === "COMPLETED") {
        // Status zakończony, spróbuj ponownie pobrać wynik po krótkim czasie
        scheduleNextCheck(1000);
        return;
      }

      // Status pending / processing - kontynuuj polling
      setState("pending");
      scheduleNextCheck();
    } catch (err) {
      console.error("❌ [useMeasurementValue] Błąd pobierania statusu:", err);
      setError("Nie udało się pobrać statusu pomiaru.");
      setState("error");
      stopPolling();
    }
  }, [measurementId, scheduleNextCheck, side, stopPolling]);

  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  useEffect(() => {
    setValue(null);
    setLastStatus(null);
    setState("loading");
    fetchDataRef.current?.();

    return () => {
      stopPolling();
    };
  }, [measurementId, side, stopPolling]);

  const refresh = useCallback(() => {
    stopPolling();
    fetchDataRef.current?.();
  }, [stopPolling]);

  return {
    state,
    value,
    lastStatus,
    error,
    isLoading: state === "loading" || state === "pending",
    refresh,
  };
}
