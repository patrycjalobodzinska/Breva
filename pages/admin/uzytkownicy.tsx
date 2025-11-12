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
  Key,
  Calendar,
  Users,
  BarChart3,
  Trash2,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useRouter } from "next/router";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name?: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
  _count: {
    measurements: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  useEffect(() => {
    fetchUsers();
  }, [searchTerm]); // Odśwież gdy zmieni się searchTerm

  const fetchUsers = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
        setCurrentPage(page);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
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
    fetchUsers(page);
  };

  const handleDeleteClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation(); // Zapobiegaj przejściu do szczegółów użytkownika
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Użytkownik został usunięty pomyślnie");
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        // Odśwież listę użytkowników
        fetchUsers(currentPage);
      } else {
        const data = await response.json();
        toast.error(data.error || "Wystąpił błąd podczas usuwania użytkownika");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Wystąpił błąd podczas usuwania użytkownika");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-text-primary">
              Użytkownicy
            </h1>
          </div>
          <Card className="rounded-2xl bg-white/90">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <p className="text-text-muted">Ładowanie użytkowników...</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text-primary">Użytkownicy</h1>
          <div className="text-sm text-text-muted">
            {users.length} użytkowników
          </div>
        </div>

        {/* Search */}
        <Card className="rounded-2xl bg-white backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                placeholder="Szukaj użytkowników..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-2xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        {users.length === 0 ? (
          <Card className="rounded-2xl bg-white backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Brak użytkowników</h3>
              <p className="text-text-muted">
                {searchTerm
                  ? "Nie znaleziono użytkowników pasujących do wyszukiwania"
                  : "Brak użytkowników w systemie"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white overflow-hidden backdrop-blur-sm shadow-sm rounded-2xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Użytkownik</TableHead>
                  <TableHead>Rola</TableHead>
                  <TableHead>Pomiary</TableHead>
                  <TableHead>Data rejestracji</TableHead>
                  <TableHead className="w-[100px]">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    onClick={() => router.push(`/admin/uzytkownicy/${user.id}`)}
                    className="cursor-pointer "
                    key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {user.name || "Brak imienia"}
                        </p>
                        <p className="text-sm text-text-muted">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "ADMIN" ? "destructive" : "default"
                        }
                        className="rounded-full">
                        {user.role === "ADMIN" ? "Admin" : "Użytkownik"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <BarChart3 className="h-4 w-4 mr-1 text-text-muted" />
                        {user._count.measurements}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-text-muted">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(user.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {session?.user?.id !== user.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteClick(e, user)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-red-600">
                Usuń użytkownika
              </DialogTitle>
              <DialogDescription>
                Czy na pewno chcesz usunąć użytkownika{" "}
                <strong>{userToDelete?.name || userToDelete?.email}</strong>? Ta
                akcja jest nieodwracalna i spowoduje usunięcie wszystkich
                powiązanych danych, w tym pomiarów.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setUserToDelete(null);
                }}
                disabled={isDeleting}>
                Anuluj
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}>
                {isDeleting ? "Usuwanie..." : "Usuń"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
