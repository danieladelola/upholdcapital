import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Trade, Asset, User } from "@/generated/prisma/browser";

type TradeWithIncludes = Trade & { asset: Asset; user: User };

export default function AdminTradesPage() {
  const [trades, setTrades] = useState<TradeWithIncludes[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<TradeWithIncludes[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tradeTypeFilter, setTradeTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    let filtered = trades;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(trade =>
        trade.asset?.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.asset?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.userId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by trade type
    if (tradeTypeFilter !== 'all') {
      filtered = filtered.filter(trade => trade.tradeType === tradeTypeFilter);
    }

    setFilteredTrades(filtered);
  }, [trades, searchTerm, tradeTypeFilter]);

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/admin/trades');
      if (response.ok) {
        const data = await response.json();
        setTrades(data as TradeWithIncludes[]);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trade History</h1>

      <div className="flex space-x-4">
        <Input
          placeholder="Search by asset, user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={tradeTypeFilter} onValueChange={setTradeTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="buy">Buy</SelectItem>
            <SelectItem value="sell">Sell</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Trades ({filteredTrades.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Price (USD)</TableHead>
                <TableHead>Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>{new Date(trade.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-sm">{trade.userId}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {trade.asset?.logoUrl && (
                        <img
                          src={trade.asset.logoUrl}
                          alt={trade.asset.name}
                          className="w-6 h-6"
                        />
                      )}
                      <div>
                        <div className="font-medium">{trade.asset?.name}</div>
                        <div className="text-sm text-muted-foreground">{trade.asset?.symbol}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      trade.tradeType === 'buy'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {trade.tradeType.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>{trade.amount}</TableCell>
                  <TableCell>${trade.priceUsd.toFixed(2)}</TableCell>
                  <TableCell>${(trade.amount * trade.priceUsd).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}