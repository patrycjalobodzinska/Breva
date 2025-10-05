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
  console.log(data);

  if (data?.length > 1) {
    const leftValues = data.map((item) => item.left);
    const rightValues = data.map((item) => item.right);

    const leftAverage =
      leftValues.reduce((sum, val) => sum + val, 0) / leftValues.length;
    const rightAverage =
      rightValues.reduce((sum, val) => sum + val, 0) / rightValues.length;

    const barData = [
      {
        side: "Lewa",
        average: leftAverage,
        min: Math.min(...leftValues),
        max: Math.max(...leftValues),
        count: leftValues.length,
      },
      {
        side: "Prawa",
        average: rightAverage,
        min: Math.min(...rightValues),
        max: Math.max(...rightValues),
        count: rightValues.length,
      },
    ];

    return (
      <Card className="rounded-2xl bg-white">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={barData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="side" tick={{ fontSize: 12 }} />
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
                  name === "min" ? "Pomiar ręczny" : "Pomiar AI",
                ]}
                labelFormatter={(label) => `Strona: ${label}`}
              />

              <Bar
                dataKey="min"
                fill="#ff9999"
                name="min"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="max"
                fill="#ff6666"
                name="max"
                radius={[0, 0, 4, 4]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  } else return null;
};
