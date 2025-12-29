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
    id: string;
    name: string;
    price: number;
    duration: string;
    features: any;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
  }
  onSubscribe: (planId: string) => void
}

export function PlanCard({ plan, onSubscribe }: PlanCardProps) {

  const handleSubscribe = () => {
    onSubscribe(plan.id)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="inline-flex w-full justify-evenly">

          {plan.name} 
            <Avatar className="inline-block">
              <AvatarImage src="/placeholder.png"/>
            </Avatar>
          </div>
           </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="font-medium">${plan.price.toLocaleString('en-US')}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{plan.duration}</p>
            </div>
            {plan.features && (
              <div>
                <p className="text-sm text-muted-foreground">Features:</p>
                <ul className="text-sm">
                  {Array.isArray(plan.features) ? plan.features.map((feature, idx) => (
                    <li key={idx}>- {feature}</li>
                  )) : <li>{JSON.stringify(plan.features)}</li>}
                </ul>
              </div>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full">
                Subscribe
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Subscribe to {plan.name} for ${plan.price.toLocaleString('en-US')}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will subscribe you to the plan for {plan.duration}.
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

