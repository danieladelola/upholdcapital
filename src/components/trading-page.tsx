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
        <div className="container mx-auto space-y-6">

      <h1 className="text-3xl font-bold">Trade</h1>
      <div className="container flex md:flex-row  max-md:flex-wrap min-h-[500px] h-full" >
        <ResponsiveContainer  height={'500px'}>
          <TradingviewWidget symbol={selectedSymbol} />
        </ResponsiveContainer>


        <TradingControls user={user} userBalance={balance} assets={assets} onAssetSelect={setSelectedSymbol} />
      </div>
      <SingleTicker/>
      <TradesTable activeTab={activeTab} trades={tradeHistory} setActiveTab={setActiveTab} />
    </div>


  )
}

