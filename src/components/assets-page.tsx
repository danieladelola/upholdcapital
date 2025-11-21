"use client"

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@clerk/nextjs";
import type { UserAsset,Asset } from "../../types";

interface Activity {
  description: string;
  date: string;
}



const recentActivity: Activity[] = [];
// take an asset string as a prop
export function AssetsPage({assets}:{assets:Asset[]}) {
const [searchTerm,setSearchTerm] = useState("")
const [balance,setBalance] = useState(0)
    useEffect(()=>{
      const balance = assets.reduce((acc, asset) => acc + asset.amount * asset.price, 0);
    setBalance(balance);

},[assets])
  const tslaIndex = assets.findIndex((asset) => asset.symbol === "TSLA");
  if (tslaIndex !== -1) {
    const tsla = assets.splice(tslaIndex, 1);
    assets.unshift(tsla[0]);
  }
  const filteredAssets = useMemo(
    () =>
      assets.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [assets, searchTerm]
  );

  return (
    <div className="w-full p-4 space-y-4 max-w-full overflow-x-hidden">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-bold">Assets</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${balance.toLocaleString('en-US')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[100px]">
              <ul className="space-y-2">
                {recentActivity.map((activity, index) => (
                  <li
                    key={index}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center"
                  >
                    <span className="text-sm">{activity.description}</span>
                    <span className="text-xs text-muted-foreground">{activity.date}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search for assets"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All assets</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Current price (USD)</TableHead>
                  <TableHead>In your wallet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.symbol}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <img
                          src={asset.icon}
                          alt={asset.name}
                          className="w-6 h-6"
                        />
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {asset.symbol}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{asset.type}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      ${asset.price.toFixed(2)}/{asset.symbol}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {asset.amount.toFixed(2)} {asset.symbol}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${(asset.amount * asset.price).toFixed(2)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
