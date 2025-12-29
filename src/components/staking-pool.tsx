import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface StakingPoolProps {
  asset: {
    id: string
    name: string
    symbol: string
    logoUrl?: string
    stakeRoi?: number
    stakeMin?: number
    stakeMax?: number
    stakeCycleDays?: number
    userBalance: number
  }
  onStake: () => void
}

export function StakingPool({ asset, onStake }: StakingPoolProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {asset.logoUrl ? (
            <img src={asset.logoUrl} alt={`${asset.name} logo`} className="h-6 w-6" />
          ) : (
            <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">{asset.symbol.charAt(0)}</span>
            </div>
          )}
          <span>{asset.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold mb-4">{asset.symbol}</p>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">ROI:</span> {asset.stakeRoi || 0}%
          </p>
          <p>
            <span className="font-semibold">Min:</span> {asset.stakeMin || 0}
          </p>
          <p>
            <span className="font-semibold">Max:</span> {asset.stakeMax || 0}
          </p>
          <p>
            <span className="font-semibold">Cycle:</span> {asset.stakeCycleDays || 0} days
          </p>
          <p>
            <span className="font-semibold">Balance:</span> {asset.userBalance}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onStake} className="w-full">Stake</Button>
      </CardFooter>
    </Card>
  )
}

