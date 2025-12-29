"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/actions/admin";
import { User, UserRole } from "@/generated/prisma/browser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/AuthProvider";
import { EditUserModal } from "@/components/admin/edit-user-modal";
import { UpdateBalanceModal } from "@/components/admin/update-balance-modal";
import { ChangeRoleModal } from "@/components/admin/change-role-modal";

const ADMIN_ID = "admin_placeholder_id"; // Replace with actual admin ID from session

export default function AdminUsersPage() {
  const { user: admin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [loading, setLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isBalanceModalOpen, setBalanceModalOpen] = useState(false);
  const [isRoleModalOpen, setRoleModalOpen] = useState(false);

  const fetchUsers = async (page: number, search: string, role: UserRole | "") => {
    setLoading(true);
    const result = await getUsers({
      page,
      search: search || undefined,
      role: role || undefined,
    });

    if (result.success && result.users) {
      setUsers(result.users);
      setTotalPages(result.totalPages || 1);
      setCurrentPage(result.currentPage || 1);
    } else {
      console.error("Failed to fetch users");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers(currentPage, search, role);
  }, [currentPage, search, role]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleChange = (value: string) => {
    setRole(value as UserRole | "");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const openBalanceModal = (user: User) => {
    setSelectedUser(user);
    setBalanceModalOpen(true);
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setRoleModalOpen(true);
  };

  const handleUserUpdate = () => {
    fetchUsers(currentPage, search, role);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={handleSearchChange}
            className="w-64"
          />
          <Select onValueChange={handleRoleChange} value={role}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              <SelectItem value={UserRole.USER}>User</SelectItem>
              <SelectItem value={UserRole.TRADER}>Trader</SelectItem>
              <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.balance}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => openEditModal(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => openBalanceModal(user)}
                    >
                      Update Balance
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRoleModal(user)}
                    >
                      Change Role
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
            <div>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      <EditUserModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUserUpdate={handleUserUpdate}
        adminId={admin?.id || ""}
      />
      <UpdateBalanceModal
        user={selectedUser}
        isOpen={isBalanceModalOpen}
        onClose={() => setBalanceModalOpen(false)}
        onUserUpdate={handleUserUpdate}
        adminId={admin?.id || ""}
      />
      <ChangeRoleModal
        user={selectedUser}
        isOpen={isRoleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        onUserUpdate={handleUserUpdate}
        adminId={admin?.id || ""}
      />
    </div>
  );
}
