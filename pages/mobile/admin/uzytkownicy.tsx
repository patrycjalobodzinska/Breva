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
  ChevronRight,
  Trash2,
} from "lucide-react";
import MobileAdminLayout from "@/components/layout/MobileAdminLayout";
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
      <MobileAdminLayout>
        <div className="space-y-4">
          <Card className="rounded-2xl bg-white/90">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <p className="text-text-muted">Ładowanie użytkowników...</p>
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
          <h1 className="text-2xl font-bold text-text-primary">Użytkownicy</h1>
          <Badge className="rounded-full">{users.length}</Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Szukaj użytkowników..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl bg-white/90"
          />
        </div>

        {/* Users List */}
        {users.length === 0 ? (
          <Card className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Brak użytkowników</h3>
              <p className="text-text-muted text-sm">
                {searchTerm
                  ? "Nie znaleziono użytkowników pasujących do wyszukiwania"
                  : "Brak użytkowników w systemie"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <Card
                key={user.id}
                className="rounded-2xl bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() =>
                        router.push(`/mobile/admin/uzytkownicy/${user.id}`)
                      }>
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-semibold text-text-primary">
                          {user.name || "Brak imienia"}
                        </p>
                        <Badge
                          variant={
                            user.role === "ADMIN" ? "destructive" : "default"
                          }
                          className="rounded-full text-xs">
                          {user.role === "ADMIN" ? "Admin" : "Użytkownik"}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-muted mb-2">
                        {user.email}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-text-muted">
                        <div className="flex items-center">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          {user._count.measurements} pomiarów
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {session?.user?.id !== user.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteClick(e, user)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      <ChevronRight className="h-5 w-5 text-text-muted" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => handlePageChange(currentPage - 1)}
              className="rounded-xl">
              Poprzednia
            </Button>
            <div className="flex items-center px-4 text-sm text-text-muted">
              Strona {pagination.page} z {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => handlePageChange(currentPage + 1)}
              className="rounded-xl">
              Następna
            </Button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-red-600">Usuń użytkownika</DialogTitle>
              <DialogDescription>
                Czy na pewno chcesz usunąć użytkownika{" "}
                <strong>{userToDelete?.name || userToDelete?.email}</strong>?
                Ta akcja jest nieodwracalna i spowoduje usunięcie wszystkich
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
    </MobileAdminLayout>
  );
}
