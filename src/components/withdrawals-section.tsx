"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { createWithdrawal } from "@/actions/withdrawal-actions"

interface Withdrawal {
  id: string
  amountUsd: number
  cryptoType: string | null
  address: string | null
  status: string
  createdAt: string
  updatedAt: string
}

const CRYPTOCURRENCY_OPTIONS = [
  { value: "ETH", label: "ETH" },
  { value: "BTC", label: "BTC" },
  { value: "USDT", label: "USDT" },
  { value: "USDC", label: "USD COIN" },
  { value: "SOL", label: "SOLANA" },
  { value: "TRX", label: "TRON" },
]

export function WithdrawalsSection({ user, balance }: { user: any, balance: number }) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [amount, setAmount] = useState("")
  const [cryptoType, setCryptoType] = useState("")
  const [address, setAddress] = useState("")
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
    if (!cryptoType) {
      toast({ title: "Error", description: "Please select a cryptocurrency" });
      return;
    }
    if (!address || address.trim() === "") {
      toast({ title: "Error", description: "Please enter a withdrawal address" });
      return;
    }

    setIsSubmitting(true);
    try {
      await createWithdrawal(user.id, withdrawalAmount, cryptoType, address);
      toast({ title: "Success", description: "Withdrawal request submitted successfully" });
      setAmount("");
      setCryptoType("");
      setAddress("");
      fetchWithdrawals();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit withdrawal request" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-lg shadow" style={{ backgroundColor: '#0E141B' }}>
        <h2 className="text-2xl font-bold mb-4 text-white">Request Withdrawal</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-200">Amount (USD)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              className="bg-gray-900 text-white border-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-200">Cryptocurrency</label>
            <Select value={cryptoType} onValueChange={setCryptoType}>
              <SelectTrigger className="bg-gray-900 text-white border-gray-700">
                <SelectValue placeholder="Select cryptocurrency" />
              </SelectTrigger>
              <SelectContent>
                {CRYPTOCURRENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-200">Withdrawal Address</label>
            <Input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your withdrawal address"
              className="bg-gray-900 text-white border-gray-700"
            />
          </div>
          
          <div className="text-sm text-gray-400">
            Available Balance: ${balance.toFixed(2)}
          </div>
          <Button onClick={handleWithdrawal} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Request Withdrawal"}
          </Button>
        </div>
      </div>

      <div className="p-6 rounded-lg shadow" style={{ backgroundColor: '#0E141B' }}>
        <h2 className="text-2xl font-bold mb-4 text-white">Withdrawal History</h2>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Date</TableHead>
              <TableHead className="text-gray-300">Amount (USD)</TableHead>
              <TableHead className="text-gray-300">Cryptocurrency</TableHead>
              <TableHead className="text-gray-300">Address</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.id} className="border-gray-700 hover:bg-gray-900">
                <TableCell className="text-gray-300">{new Date(withdrawal.createdAt).toLocaleString('en-US')}</TableCell>
                <TableCell className="text-gray-300">${withdrawal.amountUsd.toFixed(2)}</TableCell>
                <TableCell className="text-gray-300">{withdrawal.cryptoType || '-'}</TableCell>
                <TableCell className="text-gray-300 max-w-xs truncate text-xs">{withdrawal.address || '-'}</TableCell>
                <TableCell className="text-gray-300">{withdrawal.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

