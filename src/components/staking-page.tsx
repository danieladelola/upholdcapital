"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { StakingPool } from "./staking-pool"
import { StakingModal } from "./staking-modal"
import { useAuth } from "@/components/AuthProvider"
import { StakeCard } from "./stake-card"
import { UserAsset } from "../../types"
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

type AssetStaking = {
  id: string
  name: string
  symbol: string
  logoUrl?: string
  stakingEnabled: boolean
  stakeMin?: number
  stakeMax?: number
  stakeRoi?: number
  stakeCycleDays?: number
  userBalance: number
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
  const [selectedAsset, setSelectedAsset] = useState<AssetStaking | null>(null)
  const [isStakingModalOpen, setIsStakingModalOpen] = useState(false)
  const [assetsStaking, setAssetsStaking] = useState<AssetStaking[]>([])
  const [userStakes, setUserStakes] = useState<UserStake[]>([])
  const { toast } = useToast()
  const uid = user?.id
  const { userAssets: subscribedAssets, getAmount, updateAmount } = useUserAssets(uid)

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    const res = await fetch('/api/user/assets')
    if (res.ok) {
      const data: AssetStaking[] = await res.json()
      setAssetsStaking(data.filter(a => a.stakingEnabled))
    }
  }



  const handleStake = (asset: AssetStaking) => {
    setSelectedAsset(asset)
    setIsStakingModalOpen(true)
  }

  const handleStakingComplete = async (amount: number) => {
    if (!selectedAsset) return

    try {
      const res = await fetch('/api/user/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: selectedAsset.id, amount }),
      })
      if (res.ok) {
        // Refresh assets
        await fetchAssets()
        setIsStakingModalOpen(false)
        toast({ title: 'Staking successful' })
      } else {
        const error = await res.json()
        toast({ title: 'Staking failed', description: error.error })
      }
    } catch (err) {
      toast({ title: 'Staking error', description: 'Failed to complete staking' })
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

      {selectedAsset && (
        <StakingModal
          isOpen={isStakingModalOpen}
          onClose={() => setIsStakingModalOpen(false)}
          asset={selectedAsset}
          onStake={handleStakingComplete}
        />
      )}

      {/* Staking by asset section (requested) */}
      <h2 className="text-2xl font-bold">Stake by asset</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {assetsStaking.map((asset) => (
          <StakingPool key={asset.symbol} asset={asset} onStake={() => handleStake(asset)} />
        ))}
      </div>
    </div>
  )
}