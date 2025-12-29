"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface WalletConnection {
  id: string
  walletName: string
  uid: string
  key: string
}

export default function WalletConnections() {
  const [wallets, setWallets] = useState<WalletConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // useEffect(() => {
  //   const unsubscribe = db.collection("wallets")
  //     .onSnapshot(
  //       (snapshot) => {
  //         const newWallets = snapshot.docs.map((doc) => ({
  //           id: doc.id,
  //           ...doc.data()
  //         })) as WalletConnection[]
  //         setWallets(newWallets)
  //         setLoading(false)
  //       },
  //       (err) => {
  //         console.error("Error fetching wallets:", err)
  //         setError("Failed to load wallet connections. Please try again later.")
  //         setLoading(false)
  //       }
  //     )

  //   return () => unsubscribe()
  // }, [])

  if (loading) {
    return <div className="text-center py-4">Loading wallet connections...</div>
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Wallet Connections</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Wallet Name</TableHead>
            <TableHead>UID</TableHead>
            <TableHead>Key</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wallets.map((wallet) => (
            <TableRow key={wallet.id}>
              <TableCell>{wallet.walletName}</TableCell>
              <TableCell>{wallet.uid}</TableCell>
              <TableCell>{wallet.key}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

