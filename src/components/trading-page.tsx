"use client"

import { useState } from "react"
import { TradingControls } from "./trading-controls"
import { TradesTable } from "./trades-table"
import TradingviewWidget from "./TradingviewWidget"
import { db } from "@/lib/firebase"
import { useEffect } from "react"
import { Asset,Trade } from "../../types"
import { ResponsiveContainer } from "recharts"
import TradingViewTickerTape from "./TickerWidget"
import type { User} from "@clerk/nextjs/server"

export function TradingPage({assets,user,balance}:{assets:Asset[],user:User,balance:number}) {
  const [activeTab, setActiveTab] = useState<"open" | "filled">("open")
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);

  const uid = user.id;
  useEffect(() => {
    const unsubscribeTrades = db
    .collection('users')
    .doc(uid)
    .collection('trades')
    .onSnapshot(snapshot => {
      const updatedTrades = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          date: data.date,
          asset: data.asset,
          from: data.from,
          to: data.to,
          amount: data.amount,
          value: data.value,
          action: data.action,
          filled: data.filled
        }
      })
      setTradeHistory(updatedTrades)
    });

    return () => {
      unsubscribeTrades();
    };
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

