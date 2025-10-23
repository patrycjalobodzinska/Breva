import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartData } from "@/types";

interface MeasurementChartProps {
  data: ChartData[];
  title: string;
  description: string;
}

export const MeasurementChart = ({
  data,
  title,
  description,
}: MeasurementChartProps) => {
  console.log("Chart data:", data);

  if (!data || data.length === 0) {
    return (
      <Card className="rounded-2xl bg-white">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-text-muted">
            Brak danych do wyświetlenia
          </div>
        </CardContent>
      </Card>
    );
  }

  // Przygotuj dane dla wykresu
  const chartData = data.map((item, index) => ({
    name: item.name,
    left: item.left,
    right: item.right,
    date: item.date,
  }));

  return (
    <Card className="rounded-2xl bg-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              label={{
                value: "Objętość (ml)",
                angle: -90,
                position: "insideLeft",
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value, name) => [
                `${Number(value).toFixed(1)} ml`,
                name === "left" ? "Lewa pierś" : "Prawa pierś",
              ]}
              labelFormatter={(label) => `Pomiar: ${label}`}
            />

            <Bar
              dataKey="left"
              fill="#ff9999"
              name="left"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="right"
              fill="#ff6666"
              name="right"
              radius={[0, 0, 4, 4]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
