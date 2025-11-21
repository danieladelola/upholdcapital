"use client";

import { useUser } from "@clerk/nextjs";
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
import { db } from "@/lib/firebase";
import { UserProfile } from "types";
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

export default function UsersManagement() {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [balanceChanges, setBalanceChanges] = useState<{ [key: string]: number }>({});
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = db.collection("users").onSnapshot((snapshot) => {
      const newUsers = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as UserProfile[];
      setUsers(newUsers);
    });

    return () => unsubscribe();
  }, []);

  const handleBalanceChange = (uid: string, amount: number) => {
    setBalanceChanges({ ...balanceChanges, [uid]: amount });
  };

  const handleUpdateBalance = async (uid: string) => {
    const amount = balanceChanges[uid];
    if (amount !== undefined) {
      await updateUserBalance(uid, amount);
      setBalanceChanges({ ...balanceChanges, [uid]: 0 });
      toast({
        title: "Success",
        description: "User balance updated successfully.",
      });
    }
  };

  const handleRoleChangeClick = (user: UserProfile) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (selectedUser) {
      const newRole = selectedUser.role === "trader" ? "user" : "trader";
      try {
        await updateUserRole(selectedUser.uid, newRole);
        toast({
          title: "Success",
          description: `User role updated to ${newRole}.`,
        });
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
            <TableRow key={user.uid}>
              <TableCell>{user.displayName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell>{user.balance}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={balanceChanges[user.uid] || 0}
                    onChange={(e) =>
                      handleBalanceChange(user.uid, parseFloat(e.target.value))
                    }
                    className="w-24"
                  />
                  <Button onClick={() => handleUpdateBalance(user.uid)}>
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
                You are about to change the role for {selectedUser.displayName}.
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

