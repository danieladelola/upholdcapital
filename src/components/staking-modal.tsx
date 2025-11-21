"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Asset } from '../../types';
import { db } from '@/lib/firebase'
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@clerk/nextjs'

interface StakingModalProps {
  isOpen: boolean
  onClose: () => void
  pool: {
    name: string
    symbol: string
    minimum: number
    maximum: number
    roi:number
  }
  onStake: (amount: number,duration:number) => void
  assets: Asset[]
  userId?: string
  // total USD balance of the user (optional). When provided, the modal will show this
  // value as the "Current balance" formatted like the StatCard component.
  totalBalance?: number
}

export function StakingModal({ isOpen, onClose, pool, onStake,assets, userId, totalBalance }: StakingModalProps) {
  const [amount, setAmount] = useState(pool.minimum.toString())
  const [duration, setDuration] = useState("1")
  const sasset = assets.find(value=>value.symbol == pool.symbol)
  const { user } = useUser()
  // Prefer a provided userId prop (server/parent), fallback to client useUser()
  const uid = userId ?? user?.id
  const [liveBalance, setLiveBalance] = useState<number | null>(sasset?.amount ?? null)
  // Internal total balance (USD) fetched from user's document when totalBalance prop isn't provided
  const [internalTotalBalance, setInternalTotalBalance] = useState<number | null>(totalBalance ?? null)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // If we were passed assets that already contain the balance, prefer that.
    if (sasset?.amount != null) {
      setLiveBalance(sasset.amount)
      return
    }

    // Avoid calling doc() with an empty path — ensure uid and pool.symbol are valid
    if (!uid || !pool?.symbol) {
      // fallback to any provided asset amount or zero
      setLiveBalance(sasset?.amount ?? 0)
      return
    }

    const docRef = db.collection('users').doc(uid).collection('assets').doc(String(pool.symbol))
    const unsubscribe = docRef.onSnapshot((doc) => {
      if (!doc.exists) {
        setLiveBalance(0)
        return
      }
      const data = doc.data() as { amount?: number } | undefined
      setLiveBalance(data?.amount ?? 0)
    }, (err) => {
      console.error('Failed to subscribe to asset balance:', err)
    })

    return () => unsubscribe()
  }, [pool.symbol, sasset?.amount, uid])

  // Subscribe to user's top-level balance (USD) if parent didn't provide it
  useEffect(() => {
    // Prefer the passed totalBalance as an initial value, but still subscribe
    // to the user's doc to get live updates after any write.
    setInternalTotalBalance(totalBalance ?? 0)

    if (!uid) {
      return
    }

    const unsubscribe = db.collection('users').doc(uid).onSnapshot((doc) => {
      if (!doc.exists) {
        setInternalTotalBalance(0)
        return
      }
      const data = doc.data() as { balance?: number } | undefined
      setInternalTotalBalance(data?.balance ?? 0)
    }, (err) => {
      console.error('Failed to subscribe to user balance:', err)
    })

    return () => unsubscribe()
  }, [uid, totalBalance])

  // Calculate token USD value if price is available
  const tokenAmount = liveBalance ?? (sasset?.amount ?? 0)
  const tokenUSDValue = sasset?.price ? tokenAmount * (sasset?.price || 0) : null

  const handleStake = async () => {
    const stakeAmount = parseFloat(amount)
    if (!(stakeAmount >= pool.minimum && stakeAmount <= pool.maximum)) return

    setSubmitting(true)
    try {
      // perform Firestore transaction to deduct balances if we have a uid
      const usdPrice = sasset?.price ?? 0
      const usdDeduction = stakeAmount * usdPrice

  // local available balances
      const availableToken = tokenAmount
      const availableUSD = internalTotalBalance ?? (totalBalance ?? 0)

      // simple client-side validation to avoid calling parent when insufficient
      if ((availableToken ?? 0) < stakeAmount && (availableUSD ?? 0) < usdDeduction) {
        // show a toast and abort
        toast({ title: 'Insufficient balance', description: `You have ${availableToken ?? 0} ${pool.symbol} and $${(availableUSD ?? 0).toFixed(2)} available` })
        setSubmitting(false)
        return
      }

      // optimistic local updates (no server writes here) — parent will do authoritative writes
      if ((availableToken ?? 0) >= stakeAmount) {
        setLiveBalance((prev) => (typeof prev === 'number' ? prev - stakeAmount : (sasset?.amount ?? 0) - stakeAmount))
      }
      if ((availableUSD ?? 0) >= usdDeduction) {
        setInternalTotalBalance((prev) => (typeof prev === 'number' ? prev - usdDeduction : (totalBalance ?? 0) - usdDeduction))
      }

      // support async onStake (call after updating balances)
      console.debug('StakingModal: calling onStake', { stakeAmount, duration })
      try {
        const res = await Promise.resolve(onStake(stakeAmount, parseInt(duration)))
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
    // This is a placeholder calculation. Replace with your actual ROI calculation logic.
    return (parseFloat(duration) * pool.roi).toFixed(2)
  }

  // Format total balance the same way as StatCard in dashboard
  // Prefer live internalTotalBalance from Firestore (if subscribed), otherwise use prop
  const effectiveTotalBalance = (internalTotalBalance !== null ? internalTotalBalance : (totalBalance ?? 0))
  const formattedTotalBalance = `$${Number(effectiveTotalBalance).toLocaleString('en-US')}`

  // Display token-level balances (prefers liveBalance subscription, falls back to passed asset amount)
  const displayTokenAmount = tokenAmount
  const displayTokenUSD = tokenUSDValue

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stake {pool.symbol}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={pool.minimum}
                max={pool.maximum}
              />
              <span>{pool.symbol}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Current balance: {displayTokenAmount} {pool.symbol}{displayTokenUSD !== null ? ` (~$${displayTokenUSD.toFixed(2)})` : ''}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(10)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1} day{i > 0 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>ROI</Label>
            <p className="text-2xl font-bold">{calculateROI()}%</p>
          </div>
          <Button onClick={handleStake} className="w-full" disabled={submitting || Number(amount) < pool.minimum || Number(amount) > pool.maximum}>
            {submitting ? 'Staking...' : 'Stake'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

