"use client";

import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { updateUserBalance, updateUserRole } from "../actions/user-actions";
import { RoleBadge } from "./role-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  usdBalance: number | null;
  role: string | null;
  verified: boolean | null;
  created_at: Date;
}

export default function UsersManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [balanceChanges, setBalanceChanges] = useState<{ [key: string]: number }>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleBalanceChange = (id: string, amount: number) => {
    setBalanceChanges({ ...balanceChanges, [id]: amount });
  };

  const handleUpdateBalance = async (id: string) => {
    const amount = balanceChanges[id];
    if (amount !== undefined) {
      try {
        const res = await fetch(`/api/admin/users/${id}/balance`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount }),
        });
        if (res.ok) {
          setBalanceChanges({ ...balanceChanges, [id]: 0 });
          toast({
            title: "Success",
            description: "User balance updated successfully.",
          });
          fetchUsers(); // refresh
        } else {
          throw new Error('Failed to update balance');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update user balance.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRoleChangeClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (selectedUser) {
      const newRole = selectedUser.role === "trader" ? "user" : "trader";
      try {
        const res = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole }),
        });
        if (res.ok) {
          toast({
            title: "Success",
            description: `User role updated to ${newRole}.`,
          });
          fetchUsers(); // refresh
        } else {
          throw new Error('Failed to update role');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update user role.",
          variant: "destructive",
        });
      } finally {
        setIsModalOpen(false);
        setSelectedUser(null);
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
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
              <TableCell>{user.firstname} {user.lastname}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <RoleBadge role={user.role || 'user'} />
              </TableCell>
              <TableCell>${user.usdBalance || 0}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={balanceChanges[user.id] || 0}
                    onChange={(e) =>
                      handleBalanceChange(user.id, parseFloat(e.target.value))
                    }
                    className="w-24"
                  />
                  <Button onClick={() => handleUpdateBalance(user.id)}>
                    Update Balance
                  </Button>
                  {user.role === "user" ? (
                    <Button
                      onClick={() => handleRoleChangeClick(user)}
                      variant="default"
                    >
                      Make Trader
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleRoleChangeClick(user)}
                      variant="destructive"
                    >
                      Revoke Trader
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedUser && (
        <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to change the role for {selectedUser.firstname} {selectedUser.lastname}.
                {selectedUser.role === "user"
                  ? " This will grant them Trader status, allowing them access to the POST TRADE feature."
                  : " This will revoke their Trader status."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmRoleChange}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

