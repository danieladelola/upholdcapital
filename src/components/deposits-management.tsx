"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { approveDeposit, declineDeposit } from "@/actions/deposit-actions"

interface Deposit {
  id: string
  userId: string
  user: {
    email: string
    firstname: string | null
    lastname: string | null
  }
  amount: number
  method: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function DepositsManagement() {
  const [deposits, setDeposits] = useState<Deposit[]>([])

  useEffect(() => {
    fetchDeposits()
  }, [])

  const fetchDeposits = async () => {
    try {
      const res = await fetch('/api/admin/deposits');
      if (res.ok) {
        const data = await res.json();
        setDeposits(data);
      }
    } catch (error) {
      console.error('Error fetching deposits:', error);
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await approveDeposit(id);
      fetchDeposits(); // Refresh the list
    } catch (error) {
      console.error('Error approving deposit:', error);
    }
  }

  const handleReject = async (id: string) => {
    try {
      await declineDeposit(id);
      fetchDeposits(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting deposit:', error);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Deposits</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deposits.map((deposit) => (
            <TableRow key={deposit.id}>
              <TableCell>{new Date(deposit.createdAt).toLocaleString('en-US')}</TableCell>
              <TableCell>{deposit.user.firstname} {deposit.user.lastname} ({deposit.user.email})</TableCell>
              <TableCell>{deposit.method}</TableCell>
              <TableCell>${deposit.amount}</TableCell>
              <TableCell>{deposit.status}</TableCell>
              <TableCell>
                {deposit.status === "pending" && (
                  <>
                    <Button onClick={() => handleApprove(deposit.id)} className="mr-2">Approve</Button>
                    <Button onClick={() => handleReject(deposit.id)} variant="destructive">Decline</Button>
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

