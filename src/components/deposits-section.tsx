"use client"

import { useState, useEffect, Fragment } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DepositModal } from "./deposit-modal"
import type { BankMethod, CryptoMethod, Deposit } from "../../types"
import { useUser } from "@clerk/nextjs"
import { db } from "@/lib/firebase"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
// Use shared Deposit type from types.ts

export function DepositsSection() {
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [bankDetails, setBankDetails] = useState<BankMethod|any>()
  const [cryptoDetails, setCryptoDetails] = useState<CryptoMethod[]>([])
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const { user } = useUser()
  const {toast} = useToast()
  useEffect(() => {
    try {
      const unsubscribe = db.collection("deposits").onSnapshot((snapshot) => {
        const updatedDeposits: Deposit[] = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }))
        const filtered = updatedDeposits.filter((deposit) => deposit.uid === user?.id)
        setDeposits(filtered)
      })
      const unsubscribeDetails = db.collection("bankMethods").onSnapshot((snapshot) => {
        const newBankDetails = snapshot.docs.map((doc) => ({
          ...doc.data(),
        })) as unknown as BankMethod[]
        setBankDetails(newBankDetails[0])
      })

      const unsubscribeCrypto = db.collection("cryptoMethods").onSnapshot((snapshot) => {
        const newCryptoMethods = snapshot.docs.map((doc) => ({
          ...doc.data(),
        })) as CryptoMethod[]
        setCryptoDetails(newCryptoMethods)
      })

      return () => {
        unsubscribe()
        unsubscribeDetails()
        unsubscribeCrypto()
      }
    } catch (e) {
      console.error(e)
    }
  }, [user])

  const filteredDeposits = deposits.filter((deposit) => {
    const matchesSearch = deposit.reference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || deposit.status === filterType || deposit.type === filterType
    return matchesSearch && matchesFilter
  })

  const handleDeposit = (amount: number, image: string, method: string, type: string, crypto?: string, network?: string, txHash?: string, address?: string) => {
    if (!user?.id) {
      alert("You need to be signed in to make a deposit")
      return
    }
    const newDeposit: Deposit = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      reference: `DEP${Date.now()}`,
      method: "Crypto",
      type: type,
      amount: amount,
      totalUSD: amount,
      status: "pending",
      uid: user.id,
      image,
      network: network || "",
      txHash: txHash || "",
      address: address || "",
    }
    try {
      db.collection("deposits").doc(newDeposit.id).set(newDeposit).then(()=>{
        toast({title:"Deposit queued",description:"deposit queued, awaiting review."})
      })
      setDeposits([newDeposit, ...deposits])
    } catch (e) {
      console.error(e)
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
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="hidden sm:table-cell">Reference</TableHead>
                <TableHead className="hidden md:table-cell">Method</TableHead>
                <TableHead className="hidden lg:table-cell">Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden xl:table-cell">Total (USD)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeposits.map((deposit) => (
                <Fragment key={deposit.id}>
                  <TableRow className="cursor-pointer" onClick={() => toggleRowExpansion(deposit.id)}>
                    <TableCell>
                      {expandedRow === deposit.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell>{deposit.date}</TableCell>
                    <TableCell className="hidden sm:table-cell">{deposit.reference}</TableCell>
                    <TableCell className="hidden md:table-cell">{deposit.method}</TableCell>
                    <TableCell className="hidden lg:table-cell">{deposit.type}</TableCell>
                    <TableCell>{deposit.amount.toFixed(2)}</TableCell>
                    <TableCell className="hidden xl:table-cell">{deposit.totalUSD.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          deposit.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : deposit.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {deposit.status}
                      </span>
                    </TableCell>
                  </TableRow>
                  {expandedRow === deposit.id && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Card>
                          <CardHeader>
                            <CardTitle>Deposit Details</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                              <div className="sm:col-span-2">
                                <dt className="font-medium">Reference</dt>
                                <dd>{deposit.reference}</dd>
                              </div>
                              <div>
                                <dt className="font-medium">Method</dt>
                                <dd>{deposit.method}</dd>
                              </div>
                              <div>
                                <dt className="font-medium">Type</dt>
                                <dd>{deposit.type}</dd>
                              </div>
                              <div>
                                <dt className="font-medium">Amount</dt>
                                <dd>{deposit.amount.toFixed(2)}</dd>
                              </div>
                              <div>
                                <dt className="font-medium">Total (USD)</dt>
                                <dd>{deposit.totalUSD.toFixed(2)}</dd>
                              </div>
                            </dl>
                          </CardContent>
                            </Card>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

