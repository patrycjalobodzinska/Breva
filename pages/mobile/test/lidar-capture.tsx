import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";

export default function LidarCaptureTestPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exampleData = {
    side: "left",
    measurementId: "test-measurement-id",
    background: {
      depth: "AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/",
      timestamp: new Date().toISOString(),
    },
    object: {
      depth: "AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/",
      mask: '[{"x":188.0,"y":75.0},{"x":224.0,"y":58.0},{"x":250.0,"y":100.0}]',
      timestamp: new Date().toISOString(),
    },
    cameraIntrinsics: {
      fx: 607.18,
      fy: 606.77,
      cx: 329.46,
      cy: 242.86,
      width: 640,
      height: 480,
    },
    metadata: {
      deviceModel: "iPhone 16 Pro",
      iosVersion: "17.0",
      appVersion: "1.0.0",
    },
  };

  const handleLoadExample = () => {
    setJsonInput(JSON.stringify(exampleData, null, 2));
    setResponse(null);
    setError(null);
    setResponseTime(null);
  };

  const handleTest = async () => {
    if (!jsonInput.trim()) {
      toast.error("Wklej dane JSON");
      return;
    }

    setIsLoading(true);
    setResponse(null);
    setError(null);
    setResponseTime(null);

    const startTime = performance.now();

    try {
      const data = JSON.parse(jsonInput);

      const response = await fetch("/api/lidar-capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const endTime = performance.now();
      const duration = endTime - startTime;
      setResponseTime(duration);

      const result = await response.json();

      if (response.ok) {
        setResponse(result);
        toast.success(`✅ Sukces! Czas odpowiedzi: ${duration.toFixed(2)}ms`);
      } else {
        setError(JSON.stringify(result, null, 2));
        toast.error(`❌ Błąd ${response.status}: ${result.error || result.message}`);
      }
    } catch (err: any) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setResponseTime(duration);

      setError(err.message || "Nieprawidłowy format JSON");
      toast.error(`❌ Błąd: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setJsonInput("");
    setResponse(null);
    setError(null);
    setResponseTime(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            🧪 Test Endpointu /api/lidar-capture
          </CardTitle>
          <p className="text-sm text-text-muted mt-2">
            Wklej dane JSON (jak w Swaggerze) aby przetestować szybkość działania
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Przyciski akcji */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleLoadExample} variant="outline">
              📋 Załaduj przykładowe dane
            </Button>
            <Button onClick={handleTest} disabled={isLoading || !jsonInput.trim()}>
              {isLoading ? (
                <>
                  <Loader variant="default" size="sm" className="mr-2" />
                  Wysyłanie...
                </>
              ) : (
                "🚀 Wyślij Request"
              )}
            </Button>
            <Button onClick={handleClear} variant="outline">
              🗑️ Wyczyść
            </Button>
          </div>

          {/* Input JSON */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Dane JSON (Request Body):
            </label>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='Wklej tutaj dane JSON, np:\n{\n  "side": "left",\n  "measurementId": "...",\n  ...\n}'
              className="font-mono text-sm min-h-[300px]"
            />
          </div>

          {/* Czas odpowiedzi */}
          {responseTime !== null && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                ⏱️ Czas odpowiedzi: <span className="font-bold">{responseTime.toFixed(2)}ms</span>
              </p>
              {responseTime < 1000 && (
                <p className="text-xs text-blue-700 mt-1">✅ Szybka odpowiedź!</p>
              )}
              {responseTime >= 1000 && responseTime < 3000 && (
                <p className="text-xs text-blue-700 mt-1">⚠️ Średnia odpowiedź</p>
              )}
              {responseTime >= 3000 && (
                <p className="text-xs text-red-700 mt-1">❌ Wolna odpowiedź</p>
              )}
            </div>
          )}

          {/* Response */}
          {response && (
            <div>
              <label className="block text-sm font-medium mb-2 text-green-700">
                ✅ Response (Success):
              </label>
              <pre className="bg-green-50 border border-green-200 rounded-lg p-4 overflow-auto max-h-[400px] text-sm font-mono">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {error && (
            <div>
              <label className="block text-sm font-medium mb-2 text-red-700">
                ❌ Error Response:
              </label>
              <pre className="bg-red-50 border border-red-200 rounded-lg p-4 overflow-auto max-h-[400px] text-sm font-mono">
                {error}
              </pre>
            </div>
          )}

          {/* Informacje */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-2">ℹ️ Informacje:</h3>
            <ul className="text-sm text-text-muted space-y-1 list-disc list-inside">
              <li>
                Endpoint: <code className="bg-gray-200 px-1 rounded">POST /api/lidar-capture</code>
              </li>
              <li>Wymagana autoryzacja (session token)</li>
              <li>Maksymalny rozmiar body: 50MB</li>
              <li>Akceptuje zarówno camelCase jak i snake_case</li>
              <li>URL: <code className="bg-gray-200 px-1 rounded">/test/lidar-capture</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
