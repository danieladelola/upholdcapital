"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Asset } from '../../types';
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/AuthProvider'

interface StakingModalProps {
  isOpen: boolean
  onClose: () => void
  asset: {
    id: string
    name: string
    symbol: string
    stakeMin?: number
    stakeMax?: number
    stakeRoi?: number
    stakeCycleDays?: number
    userBalance: number
  }
  onStake: (amount: number) => void
}

export function StakingModal({ isOpen, onClose, asset, onStake }: StakingModalProps) {
  const [amount, setAmount] = useState((asset.stakeMin || 0).toString())
  const [selectedCycle, setSelectedCycle] = useState(String(asset.stakeCycleDays || 3))
  // const sasset = assets.find(value=>value.symbol == asset.symbol)
  const { user } = useAuth()
  // Prefer a provided userId prop (server/parent), fallback to client useUser()
  const uid = user?.id
  const [liveBalance, setLiveBalance] = useState<number | null>(asset.userBalance)
  // Internal total balance (USD) fetched from user's document when totalBalance prop isn't provided
  const [internalTotalBalance, setInternalTotalBalance] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // useEffect(() => {
  //   // If we were passed assets that already contain the balance, prefer that.
  //   if (sasset?.amount != null) {
  //     setLiveBalance(sasset.amount)
  //     return
  //   }

  //   // Avoid calling doc() with an empty path — ensure uid and pool.symbol are valid
  //   if (!uid || !pool?.symbol) {
  //     // fallback to any provided asset amount or zero
  //     setLiveBalance(sasset?.amount ?? 0)
  //     return
  //   }

  //   const docRef = db.collection('users').doc(uid).collection('assets').doc(String(pool.symbol))
  //   const unsubscribe = docRef.onSnapshot((doc) => {
  //     if (!doc.exists) {
  //       setLiveBalance(0)
  //       return
  //     }
  //     const data = doc.data() as { amount?: number } | undefined
  //     setLiveBalance(data?.amount ?? 0)
  //   }, (err) => {
  //     console.error('Failed to subscribe to asset balance:', err)
  //   })

  //   return () => unsubscribe()
  // }, [pool.symbol, sasset?.amount, uid])

  // Subscribe to user's top-level balance (USD) if parent didn't provide it
  // useEffect(() => {
  //   // Prefer the passed totalBalance as an initial value, but still subscribe
  //   // to the user's doc to get live updates after any write.
  //   setInternalTotalBalance(totalBalance ?? 0)

  //   if (!uid) {
  //     return
  //   }

  //   const unsubscribe = db.collection('users').doc(uid).onSnapshot((doc) => {
  //     if (!doc.exists) {
  //       setInternalTotalBalance(0)
  //       return
  //     }
  //     const data = doc.data() as { balance?: number } | undefined
  //     setInternalTotalBalance(data?.balance ?? 0)
  //   }, (err) => {
  //     console.error('Failed to subscribe to user balance:', err)
  //   })

  //   return () => unsubscribe()
  // }, [uid, totalBalance])

  // Calculate token USD value if price is available
  const tokenAmount = liveBalance ?? 0
  const tokenUSDValue = null // TODO: Add price

  const handleStake = async () => {
    const stakeAmount = parseFloat(amount)
    if (!(stakeAmount >= (asset.stakeMin || 0) && stakeAmount <= (asset.stakeMax || 0))) return

    setSubmitting(true)
    try {
      // Check balance
      if (asset.userBalance < stakeAmount) {
        toast({ title: 'Insufficient balance', description: `You have ${asset.userBalance} ${asset.symbol} available` })
        setSubmitting(false)
        return
      }

      console.debug('StakingModal: calling onStake', { stakeAmount })
      try {
        const res = await Promise.resolve(onStake(stakeAmount))
        console.debug('StakingModal: onStake resolved', { res })
      } catch (err) {
        console.error('onStake failed:', err)
        toast({ title: 'Staking error', description: 'Failed to complete staking. Please try again.' })
      }
    } catch (err) {
      console.error('onStake failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const calculateROI = () => {
    const stakeAmount = parseFloat(amount) || 0
    const roi = asset.stakeRoi || 0
    const cycleDays = asset.stakeCycleDays || 1
    // Assuming ROI is annual, but since cycle is days, perhaps it's simple.
    // For now, profit = amount * roi / 100
    return ((stakeAmount * roi) / 100).toFixed(2)
  }

  // Format total balance the same way as StatCard in dashboard
  // Prefer live internalTotalBalance from Firestore (if subscribed), otherwise use prop
  const effectiveTotalBalance = (internalTotalBalance !== null ? internalTotalBalance : 0)
  const formattedTotalBalance = `$${Number(effectiveTotalBalance).toLocaleString('en-US')}`

  // Display token-level balances (prefers liveBalance subscription, falls back to passed asset amount)
  const displayTokenAmount = tokenAmount
  const displayTokenUSD = tokenUSDValue

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stake {asset.symbol}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">{asset.userBalance} {asset.symbol}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Stake Amount</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={asset.stakeMin || 0}
                max={asset.stakeMax || 0}
              />
              <span>{asset.symbol}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Min: {asset.stakeMin || 0} | Max: {asset.stakeMax || 0}
            </p>
          </div>
          <div>
            <Label>Cycle Duration</Label>
            <Select value={selectedCycle} onValueChange={setSelectedCycle}>
              <SelectTrigger>
                <SelectValue placeholder="Select cycle duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>ROI</Label>
            <p className="text-2xl font-bold">{calculateROI()} {asset.symbol}</p>
          </div>
          <Button 
            onClick={handleStake} 
            className="w-full" 
            disabled={
              submitting || 
              Number(amount) < (asset.stakeMin || 0) || 
              Number(amount) > (asset.stakeMax || 0) ||
              asset.userBalance < Number(amount)
            }
          >
            {submitting 
              ? 'Staking...' 
              : asset.userBalance < Number(amount)
              ? 'Insufficient Balance'
              : Number(amount) < (asset.stakeMin || 0)
              ? `Minimum ${asset.stakeMin || 0} ${asset.symbol}`
              : 'Stake'
            }
          </Button>
          
          {asset.userBalance < (asset.stakeMin || 0) && (
            <p className="text-sm text-red-500">
              You need at least {asset.stakeMin || 0} {asset.symbol} to stake
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

