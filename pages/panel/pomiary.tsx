"use client";

import { useState } from "react";
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
import { Search, Plus, Eye, Calendar, BarChart3, Trash2 } from "lucide-react";
import PanelLayout from "@/components/PanelLayout";
import { Pagination } from "@/components/ui/pagination";
import {
  getAsymmetryPercentage,
  formatDate,
  getBadgeVariant,
} from "@/utils/measurements";
import { useRouter } from "next/router";
import { useGetMeasurements } from "@/hooks/useMeasurements";

export default function MeasurementsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading } = useGetMeasurements(currentPage, 10);
  const { measurements, pagination } = data || {};
  const router = useRouter();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <PanelLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-text-primary">Pomiary</h1>
          </div>
          <Card white className="rounded-2xl">
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <p className="text-text-muted">Ładowanie pomiarów...</p>
            </CardContent>
          </Card>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-primary">Pomiary</h1>
          <Link href="/panel/przesylanie">
            <Button className="rounded-2xl bg-primary hover:bg-primary-dark">
              <Plus className="h-4 w-4 mr-2" />
              Nowy pomiar
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card className="rounded-2xl bg-white">
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
        {measurements?.length === 0 ? (
          <Card className="rounded-2xl bg-white">
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Brak pomiarów</h3>
              <p className="text-text-muted mb-4">
                {searchTerm
                  ? "Nie znaleziono pomiarów pasujących do wyszukiwania"
                  : "Nie masz jeszcze żadnych pomiarów"}
              </p>
              {!searchTerm && (
                <Link href="/panel/przesylanie">
                  <Button className="rounded-2xl bg-primary hover:bg-primary-dark">
                    <Plus className="h-4 w-4 mr-2" />
                    Rozpocznij pierwszy pomiar
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-2xl bg-white shadow-sm backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead colSpan={1}>Nazwa</TableHead>
                  <TableHead className="text-center" colSpan={2}>
                    Objetość (ml)
                    <div className="grid grid-cols-2">
                      <div className="col-span-1">
                        <p>Lewa</p>
                      </div>
                      <div className="col-span-1">
                        <p>Prawa</p>
                      </div>
                    </div>
                  </TableHead>
                  <TableHead colSpan={2} className="text-center">
                    Pomiary ręczne
                    <div className="grid grid-cols-2">
                      <div className="col-span-1">
                        <p>Lewa</p>
                      </div>
                      <div className="col-span-1">
                        <p>Prawa</p>
                      </div>
                    </div>
                  </TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurements?.map((measurement) => (
                  <TableRow
                    onClick={() =>
                      router.push(`/panel/pomiary/${measurement?.id}`)
                    }
                    className="cursor-pointer"
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

                    <TableCell colSpan={2}>
                      <div className="text-sm text-center grid-cols-2 grid">
                        <p>
                          {measurement?.aiAnalysis?.leftVolumeMl
                            ? measurement?.aiAnalysis?.leftVolumeMl?.toFixed(
                                1
                              ) + ""
                            : "-"}{" "}
                        </p>
                        <p>
                          {measurement?.aiAnalysis?.rightVolumeMl
                            ? measurement?.aiAnalysis?.rightVolumeMl?.toFixed(
                                1
                              ) + " ml"
                            : "-"}{" "}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell colSpan={2}>
                      <div className="text-sm text-center grid-cols-2 grid">
                        <p>
                          {measurement?.manualAnalysis?.leftVolumeMl
                            ? measurement?.manualAnalysis?.leftVolumeMl?.toFixed(
                                1
                              ) + ""
                            : "-"}{" "}
                        </p>
                        <p>
                          {measurement?.manualAnalysis?.rightVolumeMl
                            ? measurement?.manualAnalysis?.rightVolumeMl?.toFixed(
                                1
                              ) + " ml"
                            : "-"}{" "}
                        </p>
                      </div>
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
        {pagination && pagination?.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
