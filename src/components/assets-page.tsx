"use client"

import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/components/AuthProvider";
import type { UserAsset, FetchedAsset as Asset } from "@/types/index";
import { getUserAssets, getUserTrades } from "@/actions/trading-actions";

type Activity = {
  description: string;
  date: string;
  type: 'buy' | 'sell';
  amount: number;
  asset: string;
}
// take an asset string as a prop
export function AssetsPage({assets: apiAssets}:{assets:Asset[]}) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("")
  const [userAssets, setUserAssets] = useState<UserAsset[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        const [userAssetsData, userTradesData] = await Promise.all([
          getUserAssets(user.id),
          getUserTrades(user.id)
        ])
        
        setUserAssets(userAssetsData.map(ua => ({
          id: ua.id,
          symbol: ua.asset?.symbol || '',
          amount: ua.balance
        })))
        
        // Format recent trades for activity display
        const activities = userTradesData.slice(0, 5).map(trade => ({
          description: `${trade.tradeType.toUpperCase()} ${trade.amount} ${trade.asset.symbol}`,
          date: new Date(trade.createdAt).toLocaleDateString(),
          type: trade.tradeType as 'buy' | 'sell',
          amount: trade.amount,
          asset: trade.asset.symbol
        }))
        
        setRecentActivity(activities)
      }
      setLoading(false)
    }
    fetchUserData()
  }, [user])

  const balance = useMemo(() => {
    // Calculate total portfolio value in USD
    return userAssets.reduce((acc, userAsset) => {
      const asset = apiAssets.find(a => a.symbol === userAsset.symbol)
      if (!asset) return acc
      return acc + (userAsset.amount * (asset.price || 0))
    }, 0)
  }, [userAssets, apiAssets])

  const mergedAssets = useMemo(() => {
    return userAssets.map(userAsset => {
      const asset = apiAssets.find(a => a.symbol === userAsset.symbol)
      if (!asset) return null
      
      return {
        ...asset,
        amount: userAsset.amount,
        icon: asset.icon || `/asseticons/${asset.symbol}.svg`, // Fallback to default icon path
        price: asset.price,
        type: asset.type // Default type, could be enhanced
      }
    }).filter(Boolean) as Asset[]
  }, [userAssets, apiAssets])

  const filteredAssets = useMemo(
    () =>
      mergedAssets.filter(
        (asset) =>
          asset &&
          (asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [mergedAssets, searchTerm]
  );

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-full p-4 space-y-4 max-w-full overflow-x-hidden">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-bold">Assets</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${balance.toLocaleString('en-US')}</p>
            <p className="text-xs text-muted-foreground">Total value of all your assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[120px]">
              <ul className="space-y-2">
                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                  <li
                    key={index}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        activity.type === 'buy' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {activity.type.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium">{activity.description}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.date}</span>
                  </li>
                )) : (
                  <li className="text-sm text-muted-foreground text-center py-4">
                    No recent transactions
                  </li>
                )}
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
                      ${asset.price?.toFixed(2)}/{asset.symbol}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {asset.amount?.toFixed(2)} {asset.symbol}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${(asset.amount && asset.price ? (asset.amount * asset.price).toFixed(2) : '0.00')}
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
