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
import {
  Search,
  Eye,
  Calendar,
  BarChart3,
  User,
  Edit,
  ChevronRight,
} from "lucide-react";
import MobileAdminLayout from "@/components/layout/MobileAdminLayout";
import { useRouter } from "next/router";
import { Pagination } from "@/components/ui/pagination";

interface Measurement {
  id: string;
  name: string;
  note?: string;
  leftVolumeMl: number;
  rightVolumeMl: number;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
  manualItems?: {
    id: string;
    name: string;
    leftVolumeMl: number;
    rightVolumeMl: number;
    createdAt: string;
  }[];
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

  const router = useRouter();

  const fetchMeasurements = async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(
        `/api/admin/measurements?${params.toString()}`
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

  useEffect(() => {
    fetchMeasurements(1);
  }, [searchTerm]);

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

  const getAsymmetryPercentage = (left: number, right: number) => {
    const total = left + right;
    const difference = Math.abs(left - right);
    return ((difference / total) * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <MobileAdminLayout>
        <div className="space-y-4">
          <Card className="rounded-2xl bg-white/90">
            <CardContent className="p-8 text-center">
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <p className="text-text-muted">Ładowanie pomiarów...</p>
            </CardContent>
          </Card>
        </div>
      </MobileAdminLayout>
    );
  }

  return (
    <MobileAdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Pomiary</h1>
          <Badge className="rounded-full">{measurements?.length || 0}</Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Szukaj pomiarów..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl bg-white/90"
          />
        </div>

        {/* Measurements List */}
        {measurements?.length === 0 ? (
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
                  <TableHead>Pomiary ręczne</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurements?.map((measurement) => (
                  <TableRow
                    onClick={() =>
                      router.push(`/mobile/admin/pomiary/${measurement?.id}`)
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
                            {measurement?.user.name || "Brak imienia"}
                          </p>
                          <p className="text-sm text-text-muted">
                            {measurement?.user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <p>
                          {measurement?.leftVolumeMl
                            ? "Lewa: " +
                              measurement?.leftVolumeMl?.toFixed(1) +
                              " ml"
                            : ""}{" "}
                        </p>
                        <p>
                          {measurement?.rightVolumeMl
                            ? "Prawa: " +
                              measurement?.rightVolumeMl?.toFixed(1) +
                              " ml"
                            : ""}{" "}
                        </p>
                        {(!measurement?.rightVolumeMl ||
                          !measurement?.leftVolumeMl) && (
                          <span className="text-xs text-text-muted">Brak</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {measurement?.manualItems &&
                      measurement?.manualItems.length > 0 ? (
                        <div className="space-y-1">
                          {measurement?.manualItems.map((manual) => (
                            <div
                              key={manual.id}
                              className="text-xs text-text-muted">
                              <div className="font-medium">{manual.name}</div>
                              <div>
                                {manual.leftVolumeMl.toFixed(1)}ml /{" "}
                                {manual.rightVolumeMl?.toFixed(1)}ml
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted">Brak</span>
                      )}
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
    </MobileAdminLayout>
  );
}
