"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DepositModal } from "./deposit-modal"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { createDeposit } from "@/actions/deposit-actions"
// Use shared Deposit type from types.ts

export function DepositsSection() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const { user } = useAuth()
  const {toast} = useToast()
  useEffect(() => {
    fetchDeposits();
  }, [user]);

  const fetchDeposits = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch('/api/deposits');
      if (res.ok) {
        const data = await res.json();
        setDeposits(data);
      }
    } catch (error) {
      console.error('Error fetching deposits:', error);
    }
  }

  const filteredDeposits = deposits.filter((deposit) => {
    const matchesSearch = deposit.id.toLowerCase().includes(searchTerm.toLowerCase()) || deposit.method.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || deposit.status === filterType
    return matchesSearch && matchesFilter
  })

  const handleDeposit = async (amount: number, crypto: string, network: string, txHash: string) => {
    if (!user?.id) {
      toast({ title: "Error", description: "You need to be signed in to make a deposit" });
      return;
    }
    try {
      const method = `${crypto} (${network})`;
      await createDeposit(user.id, amount, method);
      toast({ title: "Deposit queued", description: "Deposit queued, awaiting review." });
      // Optionally refresh deposits, but since it's pending, and user sees status
    } catch (error) {
      console.error("Error creating deposit:", error);
      toast({ title: "Error", description: "Failed to create deposit" });
    }
  }

  const toggleRowExpansion = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  return (
    <div className="space-y-4 h-full ">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Deposits</h2>
        <DepositModal onDeposit={handleDeposit} />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Search for deposits"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <Select onValueChange={setFilterType} defaultValue={filterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter deposits" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {deposits.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">You have not made any deposits yet.</p>
          <DepositModal onDeposit={handleDeposit} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="hidden sm:table-cell">ID</TableHead>
                <TableHead className="hidden md:table-cell">Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeposits.map((deposit) => (
                <TableRow key={deposit.id}>
                  <TableCell>{new Date(deposit.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="hidden sm:table-cell">{deposit.id}</TableCell>
                  <TableCell className="hidden md:table-cell">{deposit.method}</TableCell>
                  <TableCell>${deposit.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        deposit.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : deposit.status === "declined"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {deposit.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

