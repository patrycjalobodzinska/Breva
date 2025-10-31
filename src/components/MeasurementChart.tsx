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
  LineChart,
  Line,
  Legend,
} from "recharts";
import { ChartData } from "@/types";

const data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

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
  if (data && data.length > 0) {
    const leftValues = data.map((item) => item.left);
    const rightValues = data.map((item) => item.right);

    // Jeśli mamy tylko jeden pomiar, pokaż go bezpośrednio
    if (data.length === 1) {
      const singleData = data[0];
      const barData = [
        {
          side: "Lewa",
          value: singleData.left,
        },
        {
          side: "Prawa",
          value: singleData.right,
        },
      ];

      return (
        <Card className="rounded-2xl bg-white/90">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              style={{ width: "200px", height: "200px" }}
              className=" z-30 bg-red-300  min-h-64 min-w-64"
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
                formatter={(value) => [
                  `${Number(value).toFixed(1)} ml`,
                  "Objętość",
                ]}
                labelFormatter={(label) => `Strona: ${label}`}
              />
              <Bar dataKey="value" fill="#ff9999" radius={[4, 4, 4, 4]} />
            </BarChart>
          </CardContent>
        </Card>
      );
    }

    // Dla wielu pomiarów - pokaż porównanie
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
          <BarChart
            style={{ width: "100%", height: "100%" }}
            data={barData}
            width={700}
            height={400}
            className="z-30 min-w-full min-h-full"
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
        </CardContent>
      </Card>
    );
  } else {
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
};
