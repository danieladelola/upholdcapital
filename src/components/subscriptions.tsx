"use client"

import { useState,useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SubscriptionBalance } from "./subscription-balance"
import { SubscriptionHistory } from "./subscription-history"
import { PlanCard } from "./plan-card"
import { SubscriptionHistoryView } from "./subscription-history-view"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Subscription } from '../../types';
import  type {CryptoMethod, BankMethod,Deposit, SubscriptionPlan, User}from '../../types';


export function Subscriptions({user,balance}:{user:User,balance:number}) {
  const {toast} = useToast()
  const uid = user?.id
  const [showHistory, setShowHistory] = useState(false)
    const [bankDetails, setBankDetails] = useState<BankMethod|any>(null)
    const [cryptoDetails, setCryptoDetails] = useState<CryptoMethod[]>([])
    const [history, setHistory] = useState<Subscription[]>([])
   const [plans, setPlans] = useState<SubscriptionPlan[]>([])

      useEffect(() => {
        // Fetch plans
        fetch('/api/subscriptions')
          .then(res => res.json())
          .then(data => setPlans(data))
          .catch(err => console.error('Error fetching plans:', err));

        // Fetch history
        fetch(`/api/subscriptions/history?userId=${uid}`)
          .then(res => res.json())
          .then(data => setHistory(data))
          .catch(err => console.error('Error fetching history:', err));

        // Keep Firebase for deposits if needed
        // const unsubscibeDetails = db.collection("bankMethods").onSnapshot((snapshot) => {
        //   const newBankDetails = snapshot.docs.map((doc) => ({
        //     ...doc.data()
        //   })) as unknown as BankMethod[]
        //   setBankDetails(newBankDetails[0])
        // })
        
        // const unsubscribeCrypto = db.collection("cryptoMethods").onSnapshot((snapshot) => {
        //   const newCryptoMethods = snapshot.docs.map((doc) => ({
        //     ...doc.data()
        //   })) as CryptoMethod[]
        //   setCryptoDetails(newCryptoMethods)
        // })
        // Return the cleanup function
        // return () => {
        //   unsubscibeDetails();
        //   unsubscribeCrypto();
        // };
      }, [user]);
      
  const handleSubscribe = async (planId: string) => {
    try {
      const response = await fetch('/api/subscriptions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: uid }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Subscribed",
          description: "Subscription successful!",
          variant: "default",
        });
        // Refresh history
        fetch('/api/subscriptions/history')
          .then(res => res.json())
          .then(data => setHistory(data))
          .catch(err => console.error('Error fetching history:', err));
      } else {
        toast({
          title: "Error",
          description: data.error || "Subscription failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      });
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
      // db.collection("deposits").doc(newDeposit.id).set(newDeposit).then(() => {
        console.log("Deposit submitted successfully")
      // })
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

