"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Wallet {
  name: string
  connected: boolean
}

interface WalletDialogProps {
  wallet: Wallet
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (wallet: Wallet,phrase:string) => void
  onDisconnect:(wallet:Wallet) => void
}

export function WalletDialog({ wallet, open, onOpenChange, onUpdate,onDisconnect }: WalletDialogProps) {
  const [address, setAddress] = useState("")

  const handleSave = () => {
    onUpdate({ ...wallet, connected: true},address) 
    onOpenChange(false)
  }

  const handleDisconnect = () => {
    onDisconnect({ ...wallet, connected: false })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect wallet</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your wallet to start enjoying your account's additional benefits.
          </p>
          <div className="space-y-2">
            <Label htmlFor="wallet-name">Wallet:</Label>
            <Input id="wallet-name" value={wallet.name} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wallet-address">Seed/Recovery Phrase:</Label>
            <Textarea
              id="wallet-address"
              placeholder={`Your ${wallet.name} Seed/Recovery Phrase:`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="flex justify-between">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="destructive" onClick={handleDisconnect}>Disconnect</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

