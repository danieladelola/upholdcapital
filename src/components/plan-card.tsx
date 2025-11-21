"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { AvatarImage } from "@radix-ui/react-avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
interface PlanCardProps {
  plan: {
    name: string
    minimum: number
    maximum: number
    duration: number
    roi: number
    sector:string
    img:string
    id:string
    description?: string
  }
  onSubscribe: (planName: string, amount: number) => void
}

export function PlanCard({ plan, onSubscribe }: PlanCardProps) {


  const [amount, setAmount] = useState(plan.minimum)


  const handleSubscribe = () => {
    const numAmount = amount
    if (numAmount >= plan.minimum && numAmount <= plan.maximum) {
      onSubscribe(plan.name, numAmount)
    }
    
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="inline-flex w-full justify-evenly">

          {plan.name} 
            <Avatar className="inline-block">
              <AvatarImage src={plan.img}/>
            </Avatar>
          </div>
           </CardTitle>
      </CardHeader>
      <CardContent>
      <CardDescription className="font-semibold">
       Sector: {plan.sector}
      </CardDescription>
      {plan.description && (
        <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
      )}
      <br />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Minimum</p>
              <p className="font-medium">${plan.minimum.toLocaleString('en-US')}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Maximum</p>
              <p className="font-medium">${plan.maximum.toLocaleString('en-US')}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Plan duration</p>
              <p className="font-medium">{plan.duration} days</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">ROI</p>
              <p className="font-medium">{plan.roi}%</p>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor={`amount-${plan.name}`} className="text-sm font-medium text-muted-foreground">
              Amount
            </label>
            <Input
              id={`amount-${plan.name}`}
              type="number"
              min={plan.minimum}
              max={plan.maximum}
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
            />
          </div>
          <AlertDialog>
      <AlertDialogTrigger asChild>
      <Button className="w-full">
            Subscribe
          </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Subscribe to plan {plan.name} at ${amount.toLocaleString('en-US')} ?</AlertDialogTitle>
          <AlertDialogDescription>
            This will lock you in to this plan for {plan.duration} days.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubscribe}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
 
        </div>
      </CardContent>
    </Card>
  )
}

