"use client"

import { useState, useMemo, useEffect, Fragment } from "react"
import { Star, Search, ChevronDown, ChevronUp } from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { FetchedAsset as Asset} from "@/types/index"
import Link from "next/link"
import { fetchAssets } from "@/app/dashboard/[...slug]/utils"

export default function MarketsPage({assets: initialAssets}:{assets:Asset[]}) {
  const [userBalance, setUserBalance] = useState(0)
  const [assets, setAssets] = useState<Asset[]>(initialAssets || [])
  const [isLoading, setIsLoading] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [filter, setFilter] = useState("All")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  // Fetch all assets from database and external APIs on mount
  useEffect(() => {
    const loadAssets = async () => {
      setIsLoading(true)
      try {
        const fetchedAssets = await fetchAssets()
        if (fetchedAssets && fetchedAssets.length > 0) {
          setAssets(fetchedAssets)
        }
      } catch (error) {
        console.error("Error fetching assets:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAssets()
  }, [])

  // Poll for asset updates every 15 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const fetchedAssets = await fetchAssets()
        if (fetchedAssets && fetchedAssets.length > 0) {
          setAssets(fetchedAssets)
        }
      } catch (error) {
        console.error("Error polling assets:", error)
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const balance = assets.reduce((acc, asset) => acc + asset.amount * asset.price, 0)
    setUserBalance(balance)
  }, [assets])

  const tslaIndex = assets.findIndex((asset) => asset.symbol === "TSLA")
  if (tslaIndex !== -1) {
    const tsla = assets.splice(tslaIndex, 1)
    assets.unshift(tsla[0])
  }

  const filteredAssets = useMemo(
    () =>
      assets.filter(
        (asset) => {
          const matchesSearch =
            asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.symbol.toLowerCase().includes(searchTerm.toLowerCase());
          
          if (filter === "All") return matchesSearch;
          if (filter === "Crypto") return matchesSearch && asset.type === "crypto";
          if (filter === "Stocks") return matchesSearch && asset.type === "stock";
          return matchesSearch;
        }
      ),
    [assets, searchTerm, filter],
  )

  const toggleWatchlist = (id: string) => {
    setWatchlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleRowExpansion = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Markets</CardTitle>
        </CardHeader>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for assets"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All assets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All assets</SelectItem>
            <SelectItem value="Crypto">Crypto</SelectItem>
            <SelectItem value="Stocks">Stocks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead>Price (USD)</TableHead>
                  <TableHead className="hidden lg:table-cell">In wallet</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <Fragment key={asset.symbol}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => toggleRowExpansion(asset.symbol)}
                    >
                      <TableCell>
                        {expandedRow === asset.symbol ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Image
                            src={asset.icon || "/placeholder.svg"}
                            alt={`${asset.name} icon`}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <span className="hidden sm:inline">{asset.name}</span>
                          <span className="sm:hidden">{asset.symbol}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{asset.type}</TableCell>
                      <TableCell>${asset.price.toFixed(2)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {asset.amount.toFixed(2)} {asset.symbol}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/dashboard/trade">Trade</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedRow === asset.symbol && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Card>
                            <CardContent className="p-4">
                              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                <div className="sm:col-span-2">
                                  <dt className="font-medium">Asset</dt>
                                  <dd>
                                    {asset.name} ({asset.symbol})
                                  </dd>
                                </div>
                                <div>
                                  <dt className="font-medium">Type</dt>
                                  <dd>{asset.type}</dd>
                                </div>
                                <div>
                                  <dt className="font-medium">Price (USD)</dt>
                                  <dd>${asset.price.toFixed(2)}</dd>
                                </div>
                                <div>
                                  <dt className="font-medium">In your wallet</dt>
                                  <dd>
                                    {asset.amount.toFixed(2)} {asset.symbol}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="font-medium">Value (USD)</dt>
                                  <dd>${(asset.amount * asset.price).toFixed(2)}</dd>
                                </div>
                              </dl>
                              <div className="mt-4">
                                <Button variant="outline" size="sm" asChild className="w-full">
                                  <Link href="/dashboard/trade">Trade {asset.symbol}</Link>
                                </Button>
                              </div>
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
        </CardContent>
      </Card>
    </div>
  )
}

