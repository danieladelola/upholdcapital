"use client"

import { useEffect, useState } from "react"
import type { Asset } from "../../types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
import { ChevronDown, DollarSign, Briefcase, PieChart, TrendingUp, TrendingDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import React from "react"
import { useRouter } from "next/navigation"
import { User } from "@clerk/nextjs/server"


export default function PortfolioDashboard({
  assets,
  balance,
  user
}: {
  assets: Asset[]
  balance: number,
  user:User
}) {
  const [displayedAssets, setDisplayedAssets] = useState<Asset[]>([])
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const ownedAssets = assets.filter((value) => value.amount > 0)
    if (ownedAssets.length >= 5) {
      setDisplayedAssets(ownedAssets.slice(0, 5))
    } else {
      const remainingSlots = 5 - ownedAssets.length
      const sortedAssets = [...assets].sort((a, b) => {
        if (a.symbol === "TSLA") return -1
        if (b.symbol === "TSLA") return 1
        return b.price - a.price
      })
      const topAssetsToAdd = sortedAssets
        .filter((asset) => !ownedAssets.some((ownedAsset) => ownedAsset.symbol === asset.symbol))
        .slice(0, remainingSlots)
      setDisplayedAssets([...ownedAssets, ...topAssetsToAdd])
    }
  }, [assets])

  const toggleRowExpansion = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  const totalPortfolioValue = assets.reduce((total, asset) => total + asset.amount * asset.price, 0)

  return (
    <div className="container mx-auto p-4">
      <motion.h1
        className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-200"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome, {user?.firstName || "Investor"}!
      </motion.h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <StatCard
  title="Total Balance"
  value={`$${Number(balance || 0).toLocaleString('en-US')}`}
  icon={<DollarSign className="h-6 w-6" />}
  gradient="from-red-500 to-red-500"
/>

        <StatCard
          title="Portfolio Value"
          value={`$${totalPortfolioValue.toLocaleString('en-US')}`}
          icon={<Briefcase className="h-6 w-6" />}
          gradient="from-red-500 to-red-500"
        />
        <StatCard
          title="Asset Diversity"
          value={`${assets.filter((a) => a.amount > 0).length} assets`}
          icon={<PieChart className="h-6 w-6" />}
          gradient="from-red-500 to-red-500"
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl">Top Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedAssets.map((asset) => (
                  <React.Fragment key={asset.symbol}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleRowExpansion(asset.symbol)}
                    >
                      <TableCell>
                        <motion.div animate={{ rotate: expandedRow === asset.symbol ? 180 : 0 }}>
                          <ChevronDown className="h-4 w-4" />
                        </motion.div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Image
                            src={asset.icon || "/placeholder.svg"}
                            alt={`${asset.name} icon`}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                          <div>
                            <div>{asset.name}</div>
                            <div className="text-sm text-muted-foreground">{asset.symbol}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{asset.amount.toLocaleString('en-US')}</TableCell>
                      <TableCell className="text-right">${(asset.amount * asset.price).toLocaleString('en-US')}</TableCell>
                    </TableRow>
                    <AnimatePresence>
                      {expandedRow === asset.symbol && (
                        <TableRow>
                          <TableCell colSpan={4}>
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Card className="bg-muted/30 backdrop-blur-sm">
                                <CardContent className="p-4">
                                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                    <div>
                                      <dt className="font-medium">Current Price</dt>
                                      <dd>${asset.price.toLocaleString('en-US')}</dd>
                                    </div>
                                    <div>
                                      <dt className="font-medium">Type</dt>
                                      <dd>{asset.type}</dd>
                                    </div>
                                    <div className="sm:col-span-2 mt-4">
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          size="sm"
                                          className="bg-green-500 hover:bg-green-600"
                                          onClick={() => router.push("/dashboard/trade")}
                                        >
                                          <TrendingUp className="mr-2 h-4 w-4" />
                                          Buy
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                          onClick={() => router.push("/dashboard/trade")}
                                        >
                                          <TrendingDown className="mr-2 h-4 w-4" />
                                          Sell
                                        </Button>
                                      </div>
                                    </div>
                                  </dl>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </TableCell>
                        </TableRow>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  gradient,
}: { title: string; value: string; icon: React.ReactNode; gradient: string }) {
  return (
    <Card className="overflow-hidden">
      <div className={`bg-gradient-to-br ${gradient} p-6 transition-all duration-300 group hover:scale-105`}>
        <CardHeader className="p-0">
          <CardTitle className="text-white mb-1 flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <motion.p
            className="text-3xl md:text-4xl font-bold text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {value}
          </motion.p>
        </CardContent>
      </div>
    </Card>
  )
}

