"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WithdrawalModal } from "./withdrawal-modal"
import { db } from "@/lib/firebase"
import { useUser } from "@clerk/nextjs"
import { ChevronDown, ChevronUp } from "lucide-react"
import { User } from "@clerk/nextjs/server"

interface Withdrawal {
  id: string
  date: string
  reference: string
  method: string
  amount: number
  total: number
  type: string
  uid: string
  status: "pending" | "approved" | "rejected"
}

export function WithdrawalsSection({user,balance}:{user:User,balance:number}) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  useEffect(() => {

    const unsubscribe = db
      .collection("withdrawals")
      .where("uid", "==", user.id)
      .onSnapshot((snapshot) => {
        const updatedWithdrawals: Withdrawal[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as Withdrawal),
        }))
        setWithdrawals(updatedWithdrawals)
      })

    return () => unsubscribe()
  }
  , [user])

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const matchesSearch = withdrawal.reference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || withdrawal.status === filterType
    return matchesSearch && matchesFilter
  })

  const handleWithdraw = async (amount: number, method: string) => {
    if (!user?.id) {
      alert("You need to be signed in to make a withdrawal")
      return
    }

    const newWithdrawal: Withdrawal = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      reference: `WTH${Date.now()}`,
      method: method,
      amount: amount,
      total: amount,
      status: "pending",
      type: "regular",
      uid: user.id,
    }

    try {
      await db.collection("withdrawals").doc(newWithdrawal.id).set(newWithdrawal)
      await db
        .collection("users")
        .doc(user.id)
        .update({ balance: balance - amount })
    } catch (error) {
      console.error("Error processing withdrawal:", error)
      alert("Failed to process withdrawal. Please try again.")
    }
  }

  const toggleRowExpansion = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Withdrawals</h2>
        <WithdrawalModal onWithdraw={handleWithdraw} balance={balance} />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Search for withdrawals"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <Select onValueChange={setFilterType} defaultValue={filterType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter withdrawals" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {withdrawals.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">You have not made any withdrawals yet.</p>
          <WithdrawalModal onWithdraw={handleWithdraw} balance={balance}>
            <Button variant="link">Click here to make a withdrawal</Button>
          </WithdrawalModal>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="hidden sm:table-cell">Reference</TableHead>
                <TableHead className="hidden md:table-cell">Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden lg:table-cell">Total (USD)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWithdrawals.map((withdrawal) => (
                <>
                  <TableRow
                    key={withdrawal.id}
                    className="cursor-pointer"
                    onClick={() => toggleRowExpansion(withdrawal.id)}
                  >
                    <TableCell>
                      {expandedRow === withdrawal.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell>{withdrawal.date}</TableCell>
                    <TableCell className="hidden sm:table-cell">{withdrawal.reference}</TableCell>
                    <TableCell className="hidden md:table-cell">{withdrawal.method}</TableCell>
                    <TableCell>{withdrawal.amount.toFixed(2)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{withdrawal.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          withdrawal.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : withdrawal.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {withdrawal.status}
                      </span>
                    </TableCell>
                  </TableRow>
                  {expandedRow === withdrawal.id && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Card>
                          <CardHeader>
                            <CardTitle>Withdrawal Details</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                              <div className="sm:col-span-2">
                                <dt className="font-medium">Reference</dt>
                                <dd>{withdrawal.reference}</dd>
                              </div>
                              <div>
                                <dt className="font-medium">Method</dt>
                                <dd>{withdrawal.method}</dd>
                              </div>
                              <div>
                                <dt className="font-medium">Type</dt>
                                <dd>{withdrawal.type}</dd>
                              </div>
                              <div>
                                <dt className="font-medium">Amount</dt>
                                <dd>{withdrawal.amount.toFixed(2)}</dd>
                              </div>
                              <div>
                                <dt className="font-medium">Total (USD)</dt>
                                <dd>{withdrawal.total.toFixed(2)}</dd>
                              </div>
                            </dl>
                          </CardContent>
                        </Card>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

