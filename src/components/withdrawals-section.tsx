"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { createWithdrawal } from "@/actions/withdrawal-actions"

interface Withdrawal {
  id: string
  amountUsd: number
  status: string
  createdAt: string
  updatedAt: string
}

export function WithdrawalsSection({ user, balance }: { user: any, balance: number }) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchWithdrawals();
  }, [user]);

  const fetchWithdrawals = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch('/api/withdrawals');
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  }

  const handleWithdrawal = async () => {
    const withdrawalAmount = parseFloat(amount);
    if (!user?.id) {
      toast({ title: "Error", description: "You need to be signed in to make a withdrawal" });
      return;
    }
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount" });
      return;
    }
    if (withdrawalAmount > balance) {
      toast({ title: "Error", description: "Insufficient balance" });
      return;
    }

    setIsSubmitting(true);
    try {
      await createWithdrawal(user.id, withdrawalAmount);
      toast({ title: "Success", description: "Withdrawal request submitted successfully" });
      setAmount("");
      fetchWithdrawals();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit withdrawal request" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Request Withdrawal</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Amount (USD)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </div>
          <div className="text-sm text-gray-600">
            Available Balance: ${balance.toFixed(2)}
          </div>
          <Button onClick={handleWithdrawal} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Request Withdrawal"}
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Withdrawal History</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount (USD)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.id}>
                <TableCell>{new Date(withdrawal.createdAt).toLocaleString('en-US')}</TableCell>
                <TableCell>${withdrawal.amountUsd.toFixed(2)}</TableCell>
                <TableCell>{withdrawal.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

