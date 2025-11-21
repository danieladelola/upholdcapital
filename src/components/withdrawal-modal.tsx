"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
interface WithdrawalModalProps {
  onWithdraw: (amount: number, method: string) => void
  balance: number
  children?: React.ReactNode
}

export function WithdrawalModal({ onWithdraw, balance, children }: WithdrawalModalProps) {
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState("bank")
  const [amount, setAmount] = useState("")
  const [paypalDetails, setPaypalDetails] = useState("")
  const [cryptoAddress, setCryptoAddress] = useState("")
  const [cryptoNetwork, setCryptoNetwork] = useState("")
  const [bankDetails, setBankDetails] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onWithdraw(parseFloat(amount), method)
    setOpen(false)
  }

  const totalInEUR = parseFloat(amount) || 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Withdraw money</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Withdraw
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To make a withdrawal, select your balance, amount and verify the address you wish for payment to be made into.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="withdrawal-type">Type</Label>
            <Select onValueChange={setMethod} defaultValue={method}>
              <SelectTrigger id="withdrawal-type">
                <SelectValue placeholder="Select withdrawal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
              <span>USD</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Current balance</Label>
            <p className="text-sm font-medium">€{balance.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <Label>Total in USD</Label>
            <p className="text-sm font-medium">€{totalInEUR.toFixed(2)}</p>
          </div>

          {method === "paypal" && (
            <div className="space-y-2">
              <Label htmlFor="paypal-details">Your PayPal details</Label>
              <Input
                id="paypal-details"
                value={paypalDetails}
                onChange={(e) => setPaypalDetails(e.target.value)}
                placeholder="Enter your PayPal email"
              />
            </div>
          )}

          {method === "crypto" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="crypto-address">Crypto Address</Label>
                <Input
                  id="crypto-address"
                  value={cryptoAddress}
                  onChange={(e) => setCryptoAddress(e.target.value)}
                  placeholder="Enter your crypto address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crypto-network">Crypto Network</Label>
                <Input
                  id="crypto-network"
                  value={cryptoNetwork}
                  onChange={(e) => setCryptoNetwork(e.target.value)}
                  placeholder="Enter the crypto network"
                />
              </div>
            </>
          )}

          {method === "bank" && (
            <div className="space-y-2">
              <Label htmlFor="bank-details">Bank Details</Label>
              <Textarea
                id="bank-details"
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                placeholder="Enter your bank details"
                rows={4}
              />
            </div>
          )}

          <Button type="submit" className="w-full">Withdraw</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

