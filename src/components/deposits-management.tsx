"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { approveDeposit, rejectDeposit } from "../actions/deposit-actions"
import { db } from "@/lib/firebase"

interface Deposit {
  id: string
  date: string
  reference: string
  method: string
  type: string
  amount: number
  totalUSD: number
  status: "pending" | "approved" | "rejected"
  image: string
  uid: string
}

export default function DepositsManagement() {
  const [deposits, setDeposits] = useState<Deposit[]>([])

  useEffect(() => {
    const unsubscribe = db.collection("deposits")
      .orderBy("date", "desc")
      .onSnapshot((snapshot) => {
        const newDeposits = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Deposit[]
        setDeposits(newDeposits)
      })

    return () => unsubscribe()
  }, [])

  const handleApprove = async (id: string,amount:number,type:string,userid:string) => {
    await approveDeposit(id,amount,type,userid)
  }

  const handleReject = async (id: string) => {
    await rejectDeposit(id)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Deposits</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Total USD</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deposits.map((deposit) => (
            <TableRow key={deposit.id}>
              <TableCell>{new Date(deposit.date).toLocaleString('en-US')}</TableCell>
              <TableCell>{deposit.reference}</TableCell>
              <TableCell>{deposit.method}</TableCell>
              <TableCell>{deposit.type}</TableCell>
              <TableCell>{deposit.amount}</TableCell>
              <TableCell>{deposit.totalUSD}</TableCell>
              <TableCell>{deposit.status}</TableCell>
              <TableCell>
                {deposit.status === "pending" && (
                  <>
                    <Button onClick={() =>{ handleApprove(deposit.id,deposit.amount,deposit.type,deposit.uid); alert(`${deposit.id}, ${deposit.uid}: ${deposit}`)}} className="mr-2">Approve</Button>
                    <Button onClick={() => handleReject(deposit.id)} variant="destructive">Reject</Button>
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

