"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { addCryptoMethod,addBankMethod,deleteMethod } from "@/actions/deposit-method-actions"
import { db } from "@/lib/firebase"

export type CryptoMethod = {
  id?: string
  name: string
  address: string
  network: string
  icon?: string
  symbol: string
}

export type BankMethod = {
  id?: string
  name: string
  accountType: string
  accountNumber: string
  routingNumber: string
  bankName: string
  bankAddress: string
  recipientName: string
  recipientAddress: string
  country: string
}

export default function DepositMethodsManagement() {
  const [cryptoMethods, setCryptoMethods] = useState<CryptoMethod[]>([])
  const [bankMethods, setBankMethods] = useState<BankMethod[]>([])
  const [newCryptoMethod, setNewCryptoMethod] = useState<CryptoMethod>({ name: "", address: "", network: "", symbol: "" })
  const [newBankMethod, setNewBankMethod] = useState<BankMethod>({ name: "", accountType: "", accountNumber: "", routingNumber: "", bankName: "", bankAddress: "", recipientName: "", recipientAddress: "", country: "" })

  useEffect(() => {
    const unsubscribeCrypto = db.collection("cryptoMethods").onSnapshot((snapshot) => {
      const newCryptoMethods = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as CryptoMethod[]
      setCryptoMethods(newCryptoMethods)
    })

    const unsubscribeBank = db.collection("bankMethods").onSnapshot((snapshot) => {
      const newBankMethods = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as BankMethod[]
      setBankMethods(newBankMethods)
    })

    return () => {
      unsubscribeCrypto()
      unsubscribeBank()
    }
  }, [])

  const handleAddCryptoMethod = async () => {
    await addCryptoMethod(newCryptoMethod)
    setNewCryptoMethod({ name: "", address: "", network: "", symbol: "" })
  }

  const handleAddBankMethod = async () => {
    await addBankMethod(newBankMethod)
    setNewBankMethod({ name: "", accountType: "", accountNumber: "", routingNumber: "", bankName: "", bankAddress: "", recipientName: "", recipientAddress: "", country: "" })
  }

  const handleDeleteMethod = async (id: string, type: "crypto" | "bank") => {
    await deleteMethod(id, type)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Deposit Methods</h2>
      
      <h3 className="text-xl font-semibold mt-6 mb-2">Crypto Methods</h3>
      <div className="grid grid-cols-4 gap-2 mb-4">
        <Input placeholder="Name" value={newCryptoMethod.name} onChange={(e) => setNewCryptoMethod({...newCryptoMethod, name: e.target.value})} />
        <Input placeholder="Address" value={newCryptoMethod.address} onChange={(e) => setNewCryptoMethod({...newCryptoMethod, address: e.target.value})} />
        <Input placeholder="Network" value={newCryptoMethod.network} onChange={(e) => setNewCryptoMethod({...newCryptoMethod, network: e.target.value})} />
        <Input placeholder="Symbol" value={newCryptoMethod.symbol} onChange={(e) => setNewCryptoMethod({...newCryptoMethod, symbol: e.target.value})} />
      </div>
      <Button onClick={handleAddCryptoMethod} className="mb-4">Add Crypto Method</Button>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Network</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cryptoMethods.map((method) => (
            <TableRow key={method.id}>
              <TableCell>{method.name}</TableCell>
              <TableCell>{method.address}</TableCell>
              <TableCell>{method.network}</TableCell>
              <TableCell>{method.symbol}</TableCell>
              <TableCell>
                <Button onClick={() => handleDeleteMethod(method.id!, "crypto")} variant="destructive">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h3 className="text-xl font-semibold mt-6 mb-2">Bank Methods</h3>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Input placeholder="Name" value={newBankMethod.name} onChange={(e) => setNewBankMethod({...newBankMethod, name: e.target.value})} />
        <Input placeholder="Account Type" value={newBankMethod.accountType} onChange={(e) => setNewBankMethod({...newBankMethod, accountType: e.target.value})} />
        <Input placeholder="Account Number" value={newBankMethod.accountNumber} onChange={(e) => setNewBankMethod({...newBankMethod, accountNumber: e.target.value})} />
        <Input placeholder="Routing Number" value={newBankMethod.routingNumber} onChange={(e) => setNewBankMethod({...newBankMethod, routingNumber: e.target.value})} />
        <Input placeholder="Bank Name" value={newBankMethod.bankName} onChange={(e) => setNewBankMethod({...newBankMethod, bankName: e.target.value})} />
        <Input placeholder="Bank Address" value={newBankMethod.bankAddress} onChange={(e) => setNewBankMethod({...newBankMethod, bankAddress: e.target.value})} />
        <Input placeholder="Recipient Name" value={newBankMethod.recipientName} onChange={(e) => setNewBankMethod({...newBankMethod, recipientName: e.target.value})} />
        <Input placeholder="Recipient Address" value={newBankMethod.recipientAddress} onChange={(e) => setNewBankMethod({...newBankMethod, recipientAddress: e.target.value})} />
        <Input placeholder="Country" value={newBankMethod.country} onChange={(e) => setNewBankMethod({...newBankMethod, country: e.target.value})} />
      </div>
      <Button onClick={handleAddBankMethod} className="mb-4">Add Bank Method</Button>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Account Type</TableHead>
            <TableHead>Account Number</TableHead>
            <TableHead>Bank Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bankMethods.map((method) => (
            <TableRow key={method.id}>
              <TableCell>{method.name}</TableCell>
              <TableCell>{method.accountType}</TableCell>
              <TableCell>{method.accountNumber}</TableCell>
              <TableCell>{method.bankName}</TableCell>
              <TableCell>
                <Button onClick={() => handleDeleteMethod(method.id!, "bank")} variant="destructive">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

