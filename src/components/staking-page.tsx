"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { StakingPool } from "./staking-pool"
import { StakingModal } from "./staking-modal"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/AuthProvider"
import { StakeCard } from "./stake-card"
import { UserAsset } from "../../types"
import { fire } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Asset } from "../../types"
import type { User } from '../../types';
import { useUserAssets } from "@/hooks/use-user-assets"

interface StakingData {
  totalStakings: number
  activeStakings: number
  closedStakings: number
}

type Pool = {
  id?: string
  name: string
  symbol: string
  icon: string | any
  minimum: number
  maximum: number
  cycle: string
  roi: number
}

type UserStake = {
  uid: string,
  id?: string,
  symbol: string,
  // value stores token amount (for backwards compatibility). usdValue stores USD equivalent.
  value: number,
  tokenAmount?: number,
  usdValue?: number,
  startDate: number,
  duration: number,
  roi: number,
  endDate: number,
  icon: string,
  active: boolean
}

export function StakingPage({assets,user,balance}:{assets:Asset[],user:User, balance?: number}) {
  const [stakingData, setStakingData] = useState<StakingData>({
    totalStakings: 0,
    activeStakings: 0,
    closedStakings: 0,
  })
  // local visible total to avoid race conditions between optimistic updates and snapshot overwrites
  const [visibleTotal, setVisibleTotal] = useState<number>(0)
  // track authoritative totalStakings from user doc if present
  const [authoritativeTotalStakings, setAuthoritativeTotalStakings] = useState<number | null>(null)
  const [selectedPool, setSelectedPool] = useState<typeof pools[0] | null>(null)
  const [isStakingModalOpen, setIsStakingModalOpen] = useState(false)
  const [pools, setPools] = useState<Pool[]>([])
  const [userStakes, setUserStakes] = useState<UserStake[]>([])
  const { toast } = useToast()
  const uid = user?.id
  const { userAssets: subscribedAssets, getAmount, updateAmount } = useUserAssets(uid)

  // Keep visibleTotal in sync with authoritative and local totals.
  useEffect(() => {
    const auth = authoritativeTotalStakings ?? stakingData.totalStakings
    setVisibleTotal(prev => Math.max(prev, auth, stakingData.totalStakings))
  }, [stakingData.totalStakings, authoritativeTotalStakings])

  useEffect(() => {
    const unsubscribe = db.collection("stakingPools").onSnapshot((snapshot) => {
      const newPools = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Pool[]
      setPools(newPools)
    })

  const unsubscribeHistory = db.collection("stakes").onSnapshot((snapshot) => {
      const stakesFromDb = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as UserStake[]

      // Filter server stakes for this user
      const serverUserStakes = stakesFromDb.filter((stake) => stake.uid === uid)

      // Merge in any optimistic local stakes (ids starting with 'optimistic-')
      // so they aren't overwritten by the snapshot prior to server confirmation.
      setUserStakes((prevLocal) => {
        const optimisticLocal = prevLocal.filter(s => typeof s.id === 'string' && String(s.id).startsWith('optimistic-'))
          .filter(opt => !serverUserStakes.some(s => s.id === opt.id))
        const merged = [...optimisticLocal, ...serverUserStakes]

        // Compute active based on endDate: matured stakes (endDate <= now) are closed
        const nowSec = Math.floor(Date.now() / 1000)
        const normalized = merged.map((stake) => ({ ...stake, active: Boolean((stake.endDate ?? 0) > nowSec) }))

        // Calculate staking data (sum USD values when available, fallback to token value)
        const totalStakings = normalized.reduce((sum, stake) => sum + (stake.usdValue ?? stake.value ?? 0), 0)
        const activeStakings = normalized.filter((stake) => stake.active).length
        const closedStakings = normalized.filter((stake) => !stake.active).length

        setStakingData({
          totalStakings,
          activeStakings,
          closedStakings,
        })

        // Update visibleTotal to reflect authoritative or local total
        setVisibleTotal((prev) => {
          const auth = authoritativeTotalStakings === null ? totalStakings : authoritativeTotalStakings
          return Math.max(auth, totalStakings, prev)
        })

        return normalized
      })
    })

    // subscribe to user's doc for authoritative totalStakings
    let unsubscribeUserDoc: (() => void) | null = null
    if (uid) {
      unsubscribeUserDoc = db.collection('users').doc(uid).onSnapshot((doc) => {
        if (!doc.exists) {
          setAuthoritativeTotalStakings(null)
          return
        }
        const data = doc.data() as { totalStakings?: number } | undefined
        setAuthoritativeTotalStakings(data?.totalStakings ?? null)
      })
    }

    return () => {
      unsubscribe()
      unsubscribeHistory()
      if (unsubscribeUserDoc) unsubscribeUserDoc()
    }
  }, [uid])



  const handleStake = (pool: typeof pools[0]) => {
    setSelectedPool(pool)
    setIsStakingModalOpen(true)
  }

  const handleStakingComplete = async (amount: number, duration: number) => {
    const timestamp = fire.firestore.Timestamp.now().seconds
    const asset = assets.find(value => value.symbol == selectedPool?.symbol)
  const usdValue = amount * (asset?.price || 0)
  // If asset price is missing (usdValue === 0), fall back to token amount so the UI
  // still reflects the staking action. We call this displayDelta and use it for
  // optimistic UI updates and Firestore increments of totalStakings.
  const displayDelta = usdValue > 0 ? usdValue : amount

    const newStake: UserStake = {
      duration: duration,
      startDate: timestamp,
      endDate: timestamp + (duration * 24 * 60 * 60),
      roi: selectedPool?.roi || 0,
      symbol: selectedPool?.symbol || "",
      uid: uid || '',
      value: amount, // token amount
      tokenAmount: amount,
      usdValue: usdValue,
      icon: selectedPool?.icon || '',
      active: true
    }

    // Prepare optimistic updates: local stake object and updated totals
    const optimisticId = `optimistic-${Date.now()}`
    const optimisticStake: UserStake = {
      ...newStake,
      id: optimisticId
    }

    // Apply optimistic UI changes immediately (use displayDelta to ensure visible change)
    setUserStakes((prev) => [optimisticStake, ...prev])
    setStakingData((prev) => ({
      ...prev,
      totalStakings: prev.totalStakings + displayDelta,
      activeStakings: prev.activeStakings + 1
    }))
    // If there's an authoritative total from user doc, update it optimistically too
    setAuthoritativeTotalStakings((prev) => (prev ?? 0) + displayDelta)
    // update visible total immediately
  console.debug('Optimistic stake:', { amount, displayDelta, usdValue, selectedPool: selectedPool?.symbol })
  setVisibleTotal((prev) => Math.max(prev + displayDelta, (stakingData.totalStakings ?? 0) + displayDelta, (authoritativeTotalStakings ?? 0) + displayDelta))

    try {
      // fetch latest user balance
      const userDoc = await db.collection('users').doc(uid).get()
      const userData = userDoc.exists ? (userDoc.data() as any) : {}
      const userBalance = Number(userData?.balance ?? 0)
      const userAssetAmount = Number(asset?.amount ?? 0)

      // Allow staking if user has enough token amount OR enough USD balance
      if (userAssetAmount >= amount) {
        // Use token holdings to stake (update via hook for modularity)
        await updateAmount(selectedPool?.symbol || "", -amount)

        // Update USD balance and totalStakings (use displayDelta so server increments match UI)
        await db.collection('users').doc(uid).update({
          balance: fire.firestore.FieldValue.increment(-usdValue),
          totalStakings: fire.firestore.FieldValue.increment(displayDelta)
        })

        const created = await db.collection('stakes').add(newStake)
        // replace optimistic stake id with actual id
        setUserStakes((prev) => prev.map(s => s.id === optimisticId ? ({ ...s, id: created.id }) : s))
        toast({ title: 'Successfully staked', description: `Staked ${amount} ${selectedPool?.symbol} (~$${usdValue.toFixed(2)})` })
      } else if (userBalance >= usdValue) {
        // Fund stake from USD balance (no token deduction)
        await db.collection('users').doc(uid).update({
          balance: fire.firestore.FieldValue.increment(-usdValue),
          totalStakings: fire.firestore.FieldValue.increment(displayDelta)
        })
        const created = await db.collection('stakes').add(newStake)
        setUserStakes((prev) => prev.map(s => s.id === optimisticId ? ({ ...s, id: created.id }) : s))
        // when funded from USD, do not decrement token amount
        toast({ title: 'Successfully staked', description: `Staked ${amount} ${selectedPool?.symbol} (~$${usdValue.toFixed(2)}) using USD balance` })
      } else {
        // Not enough tokens or USD - rollback optimistic updates using displayDelta
  console.debug('Rollback (insufficient):', { optimisticId, displayDelta })
  setUserStakes((prev) => prev.filter(s => s.id !== optimisticId))
        setStakingData((prev) => ({
          ...prev,
          totalStakings: Math.max(0, prev.totalStakings - displayDelta),
          activeStakings: Math.max(0, prev.activeStakings - 1)
        }))
        setAuthoritativeTotalStakings((prev) => (prev == null ? null : Math.max(0, (prev ?? 0) - displayDelta)))
  setVisibleTotal((prev) => Math.max(0, prev - displayDelta))
        toast({ title: 'Insufficient balance', description: `You have ${userAssetAmount} ${selectedPool?.symbol} and $${userBalance.toFixed(2)} available` })
      }
    } catch (err) {
      console.error('Staking failed:', err)
  console.debug('Rollback (error):', { err, optimisticId, displayDelta })
  // rollback optimistic updates on error using displayDelta
  setUserStakes((prev) => prev.filter(s => s.id !== optimisticId))
      setStakingData((prev) => ({
        ...prev,
        totalStakings: Math.max(0, prev.totalStakings - displayDelta),
        activeStakings: Math.max(0, prev.activeStakings - 1)
      }))
      setAuthoritativeTotalStakings((prev) => {
        if (prev == null) return null
        return Math.max(0, prev - displayDelta)
      })
      setVisibleTotal((prev) => Math.max(0, prev - displayDelta))
      toast({ title: 'Staking error', description: 'Failed to complete staking. Please try again.' })
    } finally {
      setIsStakingModalOpen(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Staking Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-lg font-semibold">Total stakings</h3>
              {/* Show the higher of authoritative and local totals so optimistic updates are visible */}
              <p className="text-2xl font-bold">${visibleTotal.toFixed(2)}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Active stakings</h3>
              <p className="text-2xl font-bold">{stakingData.activeStakings}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Closed stakings</h3>
              <p className="text-2xl font-bold">{stakingData.closedStakings}</p>
            </div>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button>View stakings</Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Your Stakings</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[80vh]">
                {userStakes.length ? (
                  <div className="space-y-4 p-2">
                    {userStakes.map((value) => {
                      const symbol = value.symbol || ''
                      // Prefer an explicit icon stored in the stake, otherwise fall back to asseticons
                      const logoPath = value.icon && String(value.icon).length > 0
                        ? value.icon
                        : `/asseticons/${symbol}.svg`

                      // key uses id when present otherwise fallback
                      return (
                        <StakeCard
                          maturityDate={value.endDate}
                          startDate={value.startDate}
                          tokenName={value.symbol}
                          key={value.id ?? `${value.symbol}-${value.startDate}`}
                          tokenValue={value.value}
                          roi={value.roi}
                          tokenLogo={logoPath}
                        />
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4">Your staking history will be displayed here.</div>
                )}
              </ScrollArea>

            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>

      {/* Pools section removed as requested */}

      {selectedPool && (
        <StakingModal
          isOpen={isStakingModalOpen}
          onClose={() => setIsStakingModalOpen(false)}
          pool={selectedPool}
          assets={assets}
          userId={uid}
          totalBalance={balance}
          onStake={handleStakingComplete}
        />
      )}

      {/* Staking by asset section (requested) */}
      <h2 className="text-2xl font-bold">Stake by asset</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          "BTC","ETH","SOL","BCH","LTC","DOGE","USDT","MATIC","AVAX","USDC","AAVE","ALGO","ANC","APE","AURORA","AXS","BTG","BORING","ADA","XCN","LINK","CRO","DAI","DASH","MANA","ETC","EVMOS","GT","LN","XMR","NEXO","OKB","OP","OGN","ORN","DOT","XPR","RARI","SFP","SHIB","XLM","GMT","SUSHI","TLOS","XTZ","GRT","TRX","UNI","VET","WING","ZEC","XRP","ICP","VELO","HEX","PNG","RNDR","QNT","HBAR","FET","XDC","BSV","TON","PEPE","XRPH","SOLO","AAPL","ABT","ADBE","ADI","AEMD","AIG","AMC","AMD","AMT","AMZN","APT","ASML","ATER","AXP","BA","BABA","BAC","BIDU","BMY","C","CAT","CCO","CEI","CHWY","CL","CLEU","CMCSA","COST","CRDF","CRM","CSCO","CVX","DIS","EBAY","FB","FSLY","GE","GEVO","GM","GOOGL","GS","HD","HON","IBM","INMD","INTC","JNJ","JPM","KO","LEN","LVS","MA","MDLZ","MMM","MNST","MSFT","MO","MRIN","MRK","MS","MSI","NFLX","NKE","NVDA","NVS","ORCL","PEP","PFE","PG","PYPL","RACE","RKLB","RL","RWLK","SBUX","SNAP","SSRM","SQ","T","TEVA","TM","TMUS","TRIP","TSLA","TSM","TWTR","UNH","V","VZ","WFC","WMT","XOM"
        ].map((symbol) => {
          const asset = assets.find((a) => a.symbol === symbol)
          const displayName = asset?.name ?? symbol
          const iconPng = `/asseticons/${symbol}.png`
          const poolForAsset = {
            id: `asset-${symbol}`,
            name: displayName,
            symbol,
            icon: iconPng,
            minimum: 10,
            maximum: 100,
            cycle: "6 days",
            roi: 4,
          }

          const walletAmount = getAmount(symbol) || Number(asset?.amount ?? 0)

          return (
            <Card key={symbol} className="flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow pt-4">
              <CardContent className="pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border">
                      <img src={iconPng} alt={`${symbol} logo`} className="w-8 h-8 object-contain" onError={(e:any)=>{e.currentTarget.src=`/asseticons/${symbol}.svg`}} />
                    </div>
                    <div>
                      <div className="font-semibold">{displayName}</div>
                      <div className="text-sm text-muted-foreground">{symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">ROI</div>
                    <div className="font-semibold">4%</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>
                    <div className="text-xs">Min</div>
                    <div className="font-medium text-foreground">10</div>
                  </div>
                  <div>
                    <div className="text-xs">Max</div>
                    <div className="font-medium text-foreground">100</div>
                  </div>
                  <div>
                    <div className="text-xs">Cycle</div>
                    <div className="font-medium text-foreground">6 days</div>
                  </div>
                  <div>
                    <div className="text-xs">Balance</div>
                    <div className="font-medium text-foreground">{walletAmount}</div>
                  </div>
                </div>
              </CardContent>

              <div className="p-4 border-t">
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    setSelectedPool(poolForAsset as any)
                    setIsStakingModalOpen(true)
                  }}
                >
                  Stake
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}