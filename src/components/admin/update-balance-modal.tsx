"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserBalance } from "@/actions/admin";
import { User } from "@prisma/client";

interface UpdateBalanceModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: () => void;
  adminId: string;
}

export function UpdateBalanceModal({
  user,
  isOpen,
  onClose,
  onUserUpdate,
  adminId,
}: UpdateBalanceModalProps) {
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const result = await updateUserBalance(adminId, user.id, { amount });

    if (result.success) {
      onUserUpdate();
      onClose();
      setAmount(0);
    } else {
      // setError(result.error);
    }

    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Balance for {user?.email}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>Current Balance: {user?.balance}</p>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Add/Deduct</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
            />
            <p className="text-sm text-gray-500">
              Enter a positive value to add, or a negative value to deduct.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : "Update Balance"}
          </Button>
        </DialogFooter>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
