import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type LucideIcon } from 'lucide-react'

interface StakingPoolProps {
  pool: {
    name: string
    symbol: string
    icon: LucideIcon
    minimum: number
    maximum: number
    cycle: string
    roi:number
  }
  onStake: () => void
}

export function StakingPool({ pool, onStake }: StakingPoolProps) {
  const Icon = pool.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {
            typeof Icon !='string'?(<Icon className="h-6 w-6" />):(<img src={`/asseticons/${Icon}.svg`} className="h-6 w-6"/>)          }
          
          <span>{pool.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold mb-4">{pool.symbol}</p>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Minimum:</span> {pool.minimum} {pool.symbol}
          </p>
          <p>
            <span className="font-semibold">Maximum:</span> {pool.maximum} {pool.symbol}
          </p>
          <p>
            <span className="font-semibold">ROI:</span> {pool.roi}
          </p>
          <p>
            <span className="font-semibold">Cycle:</span> {pool.cycle}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onStake} className="w-full">Stake</Button>
      </CardFooter>
    </Card>
  )
}

