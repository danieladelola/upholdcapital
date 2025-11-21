"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Trade } from "../../types"

interface TradesTableProps {
  activeTab: "open" | "filled"
  setActiveTab: (tab: "open" | "filled") => void
  trades: Trade[]
}

export function TradesTable({ activeTab, setActiveTab, trades }: TradesTableProps) {
  const openTrades = trades.filter((trade) => !trade.filled)
  const filledTrades = trades.filter((trade) => trade.filled)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trades</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "open" | "filled")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="filled">Filled</TabsTrigger>
          </TabsList>
          <TabsContent value="open">
            <TradeList trades={openTrades} />
          </TabsContent>
          <TabsContent value="filled">
            <TradeList trades={filledTrades} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface TradeListProps {
  trades: Trade[]
}

function TradeList({ trades }: TradeListProps) {
  if (trades.length === 0) {
    return <p className="text-center py-4">No trades yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead>Asset</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Value ($)</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell className="hidden md:table-cell">{trade.date}</TableCell>
              <TableCell>{trade.asset.symbol}</TableCell>
              <TableCell>{trade.amount}</TableCell>
              <TableCell>${trade.value.toFixed(2)}</TableCell>
              <TableCell>{trade.action}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

