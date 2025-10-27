"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, Calendar, BarChart3, User, Edit } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useRouter } from "next/router";
import { Pagination } from "@/components/ui/pagination";

interface Measurement {
  id: string;
  name: string;
  note?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
  analyses?: BreastAnalysis[];
}

interface BreastAnalysis {
  id: string;
  side: "LEFT" | "RIGHT";
  source?: "AI" | "MANUAL";
  volumeMl?: number;
  filePath?: string;
}

export default function AdminMeasurementsPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    fetchMeasurements();
  }, []);
  const router = useRouter();
  const fetchMeasurements = async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/measurements?page=${page}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setMeasurements(data.measurements);
        setPagination(data.pagination);
        setCurrentPage(page);
      } else {
        console.error("Failed to fetch measurements");
      }
    } catch (error) {
      console.error("Error fetching measurements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMeasurements = measurements.filter(
    (measurement) =>
      measurement?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      measurement?.user.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      measurement?.user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAnalysisForSide = (
    measurement: Measurement,
    side: "LEFT" | "RIGHT"
  ) => {
    return measurement?.analyses?.find((a) => a.side === side);
  };

  const getVolumeForSide = (
    measurement: Measurement,
    side: "LEFT" | "RIGHT"
  ) => {
    const analysis = getAnalysisForSide(measurement, side);
    return analysis?.volumeMl || 0;
  };

  const getAsymmetryPercentage = (left: number, right: number) => {
    if (!left || !right) return "N/A";
    const diff = Math.abs(left - right);
    const avg = (left + right) / 2;
    const percentage = ((diff / avg) * 100).toFixed(1);
    return `${percentage}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePageChange = (page: number) => {
    fetchMeasurements(page);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-text-primary">Pomiary</h1>
          </div>
          <Card className="rounded-2xl bg-white backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <p className="text-text-muted">Ładowanie pomiarów...</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text-primary">Pomiary</h1>

        {/* Search */}
        <Card className="bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                placeholder="Szukaj pomiarów..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-2xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Measurements List */}
        {filteredMeasurements.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Brak pomiarów</h3>
              <p className="text-text-muted">
                {searchTerm
                  ? "Nie znaleziono pomiarów pasujących do wyszukiwania"
                  : "Brak pomiarów w systemie"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white overflow-hidden backdrop-blur-sm shadow-sm rounded-2xl">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-100">
                  <TableHead>Pomiar</TableHead>
                  <TableHead>Użytkownik</TableHead>
                  <TableHead>Objetość (ml)</TableHead>
                  <TableHead>Analizy</TableHead>
                  <TableHead>Asymetria</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeasurements.map((measurement) => (
                  <TableRow
                    onClick={() =>
                      router.push(`/admin/pomiary/${measurement?.id}`)
                    }
                    className="cursor-pointer "
                    key={measurement?.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{measurement?.name}</p>
                        {measurement?.note && (
                          <p className="text-sm text-text-muted">
                            {measurement?.note}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-text-muted" />
                        <div>
                          <p className="font-medium">
                            {measurement?.user?.name || "Brak imienia"}
                          </p>
                          <p className="text-sm text-text-muted">
                            {measurement?.user?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <p>
                          Lewa:{" "}
                          {getVolumeForSide(measurement, "LEFT").toFixed(1)} ml
                        </p>
                        <p>
                          Prawa:{" "}
                          {getVolumeForSide(measurement, "RIGHT").toFixed(1)} ml
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-text-muted">
                        {measurement?.analyses?.length || 0} analiz
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {getAsymmetryPercentage(
                          getVolumeForSide(measurement, "LEFT"),
                          getVolumeForSide(measurement, "RIGHT")
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-text-muted">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(measurement?.createdAt)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
