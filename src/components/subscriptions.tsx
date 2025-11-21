"use client"

import { useState,useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SubscriptionBalance } from "./subscription-balance"
import { SubscriptionHistory } from "./subscription-history"
import { PlanCard } from "./plan-card"
import { SubscriptionHistoryView } from "./subscription-history-view"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/firebase"
import { Subscription } from '../../types';
import  type {CryptoMethod, BankMethod,Deposit, SubscriptionPlan}from '../../types';
import { User } from "@clerk/nextjs/server"


export function Subscriptions({user,balance}:{user:User,balance:number}) {
  const {toast} = useToast()
  const uid = user?.id
  const [showHistory, setShowHistory] = useState(false)
    const [bankDetails, setBankDetails] = useState<BankMethod|any>(null)
    const [cryptoDetails, setCryptoDetails] = useState<CryptoMethod[]>([])
    const [history, setHistory] = useState<Subscription[]>([])
   const [plans,setPlans] = useState<SubscriptionPlan[]>([
      {
        name: "Starter Plan",
        minimum: 5000,
        maximum: 5000,
        duration: 30,
        roi: 0,
        sector: 'Crypto / Beginner',
        img: '/PNG.svg',
        id: 'starter',
        description: 'Perfect for beginners exploring crypto. Includes basic tools and limited staking access.'
      },
      {
        name: "Pro Plan",
        minimum: 10000,
        maximum: 10000,
        duration: 30,
        roi: 0,
        sector: 'Crypto / Active Traders',
        img: '/PNG.svg',
        id: 'pro',
        description: 'Designed for active traders. Offers higher limits, faster support, and extra analytics.'
      },
      {
        name: "Elite Plan",
        minimum: 15000,
        maximum: 15000,
        duration: 30,
        roi: 0,
        sector: 'Crypto / Investors',
        img: '/PNG.svg',
        id: 'elite',
        description: 'For serious investors. Unlocks advanced staking options, deeper insights, and VIP features.'
      },
      {
        name: "Titan Plan",
        minimum: 20000,
        maximum: 20000,
        duration: 30,
        roi: 0,
        sector: 'Crypto / VIP',
        img: '/PNG.svg',
        id: 'titan',
        description: 'Top-tier access with full features, maximum rewards, early updates, and personal support.'
      },
    ])

      useEffect(() => {
        try {
          const unsubscribeHistory = db.collection("users").doc(uid).collection("subscriptions").onSnapshot((snapshot) => {
            const updatedSubscriptions = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                planName: data.planName,
                amount: data.amount,
                startDate: data.startDate,
                endDate: data.endDate,
                status: data.status
              } as Subscription;
            })
            setHistory(updatedSubscriptions)
          })
          const unsubscibeDetails = db.collection("bankMethods").onSnapshot((snapshot) => {
            const newBankDetails = snapshot.docs.map((doc) => ({
              ...doc.data()
            })) as unknown as BankMethod[]
            setBankDetails(newBankDetails[0])
          })
          
          const unsubscribeCrypto = db.collection("cryptoMethods").onSnapshot((snapshot) => {
            const newCryptoMethods = snapshot.docs.map((doc) => ({
              ...doc.data()
            })) as CryptoMethod[]
            setCryptoDetails(newCryptoMethods)
          })
          // Return the cleanup function (do not invoke it)
          return () => {
            unsubscibeDetails();
            unsubscribeCrypto();
          };
        } catch (e) {
          console.error(e);
        }
      }, [user]);
      
  const handleSubscribe = (planName: string, amount: number) => {
    console.log(`Subscribed to ${planName} with amount $${amount}`)
    // Here you would typically make an API call to process the subscription
    // For now, we'll just update the balance
    if(balance>amount){
      const newSubscription:Subscription = {
        amount:amount,
        endDate: new Date(new Date().getTime() + (plans.find(plan => plan.name === planName)?.duration ?? 0) * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date().toISOString(),
        planName:planName,
        id: `sub-${Date.now()}`,
        status:'active'
      }
      db.collection('users').doc(uid).update({
        balance:balance-amount
      })
      db.collection('users').doc(uid).collection('subscriptions').add(newSubscription)

      toast({
        title: "Subscribed",
        description: `Subscribed to ${planName} with amount \$${amount}`,
        variant: "default",
      })
  }else{
    toast({
      title: "Insufficient Balance",
      description: `You have insufficient balance to subscribe to ${planName} with amount \$${amount}`,
      variant: "destructive",
    })
  }
  }

  const handleDeposit = (amount: number,image:string,method:string,type:string, crypto?: string, network?: string, txHash?: string, address?: string) => {
    // In a real application, you would make an API call here
    const newDeposit: Deposit = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      reference: `DEP${Date.now()}`,
      method: method, // This would come from the actual deposit process
      type: 'subscription',
      amount: amount,
      totalUSD: amount, // Assuming 1:1 exchange rate for simplicity
      status: "pending",
      uid: user?.id||"",
      image,
      network: network || "",
      txHash: txHash || "",
      address: address || "",
    }
    try{
      db.collection("deposits").doc(newDeposit.id).set(newDeposit).then(() => {
        console.log("Deposit submitted successfully")
      }
      )


    }catch(e){
      console.error(e)
    }

  }



  return (
    <div className="container mx-auto p-4">
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SubscriptionBalance bankDetails={bankDetails} cryptoDetails={cryptoDetails} balance={balance} onDeposit={handleDeposit} />
          <SubscriptionHistory onViewHistory={() => setShowHistory(true)} />
          {showHistory ? (
            <>
              <SubscriptionHistoryView subHistory={history} />
              <Button onClick={() => setShowHistory(false)}>Hide History</Button>
            </>
          ) : (
            <div>
              <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {plans.map((plan) => (
                  <PlanCard key={plan.name} plan={plan} onSubscribe={handleSubscribe} />
                ))}
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}

