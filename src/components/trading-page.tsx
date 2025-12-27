"use client"

import { useState } from "react"
import { TradingControls } from "./trading-controls"
import { TradesTable } from "./trades-table"
import TradingviewWidget from "./TradingviewWidget"
import { useEffect } from "react"
import { Asset,Trade } from "../../types"
import { ResponsiveContainer } from "recharts"
import TradingViewTickerTape from "./TickerWidget"
import type { User} from "../../types"
import { getUserTrades } from "@/actions/trading-actions"

export function TradingPage({assets,user,balance}:{assets:Asset[],user:User,balance:number}) {
  const [activeTab, setActiveTab] = useState<"open" | "filled">("open")
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);

  const uid = user.id;
  useEffect(() => {
    const fetchTrades = async () => {
      if (user?.id) {
        const trades = await getUserTrades(user.id)
        // Convert to the expected format for TradesTable
        const formattedTrades = trades.map(trade => ({
          id: trade.id,
          date: trade.created_at.toISOString(),
          asset: {
            name: trade.asset.name,
            symbol: trade.asset.symbol,
            type: 'crypto', // Default type
            icon: trade.asset.logo_url || '',
            price: trade.price_usd,
            amount: trade.amount
          },
          from: trade.trade_type === 'sell' ? trade.asset.symbol : undefined,
          to: trade.trade_type === 'buy' ? trade.asset.symbol : undefined,
          amount: trade.amount,
          value: trade.amount * trade.price_usd,
          action: trade.trade_type === 'buy' ? 'Buy' : 'Sell',
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
          <TradingviewWidget />
        </ResponsiveContainer>


        <TradingControls user={user} userBalance={balance} assets={assets} />
      </div>
      <TradingViewTickerTape/>
      <TradesTable activeTab={activeTab} trades={tradeHistory} setActiveTab={setActiveTab} />
    </div>


  )
}

