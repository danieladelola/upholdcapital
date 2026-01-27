"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { approveWithdrawal, declineWithdrawal } from "@/actions/withdrawal-actions"

interface Withdrawal {
  id: string
  userId: string
  user: {
    email: string
    firstname: string | null
    lastname: string | null
  }
  amountUsd: number
  cryptoType: string | null
  address: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export default function WithdrawalsManagement() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch('/api/admin/withdrawals');
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await approveWithdrawal(id);
      fetchWithdrawals(); // Refresh the list
    } catch (error) {
      console.error('Error approving withdrawal:', error);
    }
  }

  const handleReject = async (id: string) => {
    try {
      await declineWithdrawal(id);
      fetchWithdrawals(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
    }
  }

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    return filterStatus === "all" || withdrawal.status === filterStatus
  })

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Withdrawals</h2>
      <div className="mb-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Amount (USD)</TableHead>
            <TableHead>Cryptocurrency</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredWithdrawals.map((withdrawal) => (
            <TableRow key={withdrawal.id}>
              <TableCell>{new Date(withdrawal.createdAt).toLocaleString('en-US')}</TableCell>
              <TableCell>{withdrawal.user.firstname} {withdrawal.user.lastname} ({withdrawal.user.email})</TableCell>
              <TableCell>${withdrawal.amountUsd.toFixed(2)}</TableCell>
              <TableCell>{withdrawal.cryptoType || '-'}</TableCell>
              <TableCell className="max-w-xs truncate text-xs">{withdrawal.address || '-'}</TableCell>
              <TableCell>{withdrawal.status}</TableCell>
              <TableCell>
                {withdrawal.status === "pending" && (
                  <>
                    <Button onClick={() => handleApprove(withdrawal.id)} className="mr-2" size="sm">Approve</Button>
                    <Button onClick={() => handleReject(withdrawal.id)} variant="destructive" size="sm">Decline</Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}