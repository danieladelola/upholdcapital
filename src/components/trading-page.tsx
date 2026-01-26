"use client"

import { useState } from "react"
import { TradingControls } from "./trading-controls"
import { TradesTable } from "./trades-table"
import TradingviewWidget from "./TradingviewWidget"
import { useEffect } from "react"
import { FetchedAsset as Asset } from "@/types/index"
import type { UITrade, User} from "../../types"
import { getUserTrades } from "@/actions/trading-actions"
import { ResponsiveContainer } from 'recharts'
import { SingleTicker } from 'react-ts-tradingview-widgets'

export function TradingPage({assets,user,balance}:{assets:Asset[],user:User,balance:number}) {
  const [activeTab, setActiveTab] = useState<"open" | "filled">("open")
  const [tradeHistory, setTradeHistory] = useState<UITrade[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("NASDAQ:TSLA");

  const uid = user.id;
  
  // Log assets for debugging
  useEffect(() => {
    console.log('[TradingPage] Assets loaded:', {
      count: assets.length,
      assets: assets.slice(0, 5).map(a => ({
        symbol: a.symbol,
        name: a.name,
        price: a.price,
        type: a.type
      }))
    });
  }, [assets]);
  
  useEffect(() => {
    const fetchTrades = async () => {
      if (user?.id) {
        const trades = await getUserTrades(user.id)
        // Convert to the expected format for TradesTable
        const formattedTrades = trades.map(trade => ({
          id: trade.id,
          date: trade.createdAt.toISOString(),
          asset: {
            name: trade.asset.name,
            symbol: trade.asset.symbol,
            type: 'crypto', // Default type
            icon: trade.asset.logoUrl || '',
            price: trade.priceUsd,
            amount: trade.amount
          },
          from: trade.tradeType === 'sell' ? trade.asset.symbol : undefined,
          to: trade.tradeType === 'buy' ? trade.asset.symbol : undefined,
          amount: trade.amount,
          value: trade.amount * trade.priceUsd,
          action: trade.tradeType === 'buy' ? 'Buy' : 'Sell',
          filled: true
        }))
        setTradeHistory(formattedTrades)
      }
    }
    fetchTrades()
  }, [user]);


  return (
    <div className="min-h-screen bg-[#090F15] text-white">
      {/* Header Section */}
      <div className="bg-[#090F15] border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>
              <p className="text-gray-300 mt-1">Execute trades and monitor your portfolio</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Available Balance</p>
              <p className="text-2xl font-semibold text-green-400">${balance.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Trading Interface */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Chart Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-[#0b1216] rounded-lg shadow-sm border border-gray-700 p-6 min-h-[500px]">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white">Market Chart</h2>
                <p className="text-sm text-gray-300">Real-time price data for {selectedSymbol}</p>
              </div>
              <div className="h-[500px] w-full">
                <TradingviewWidget symbol={selectedSymbol} />
              </div>
            </div>
          </div>

          {/* Trading Controls Section - Takes 1 column */}
          <div className="lg:col-span-1 flex">
            <div className="w-full">
              <TradingControls user={user} userBalance={balance} assets={assets} onAssetSelect={setSelectedSymbol} />
            </div>
          </div>
        </div>

        {/* Market Overview removed */}

        {/* Trade History */}
        <div className="mt-6">
          <div className="bg-[#0b1216] rounded-lg shadow-sm border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Trade History</h2>
            <TradesTable activeTab={activeTab} trades={tradeHistory} setActiveTab={setActiveTab} />
          </div>
        </div>
      </div>
    </div>
  )
}

