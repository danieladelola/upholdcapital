import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCountdown } from "../hooks/useCountdown"
import { useState } from "react"

interface StakeCardProps {
  tokenName: string
  tokenValue: number
  tokenLogo: string
  maturityDate: number
  roi: number
  startDate: number
}

export function StakeCard({ tokenName, tokenValue, tokenLogo, maturityDate, roi, startDate }: StakeCardProps) {
  const countdown = useCountdown(new Date(maturityDate*1000))

  // compute fallback asset icon paths using the tokenName (which is a symbol like 'SOL')
  const symbol = tokenName || ''
  const defaultSvg = `/asseticons/${symbol}.svg`
  const defaultPng = `/asseticons/${symbol}.png`

  const [imgSrc, setImgSrc] = useState<string>(tokenLogo || defaultSvg)

  const handleImgError = () => {
    if (imgSrc === tokenLogo) {
      // first fallback to svg
      setImgSrc(defaultSvg)
      return
    }
    if (imgSrc === defaultSvg) {
      // then try png
      setImgSrc(defaultPng)
      return
    }
    // final fallback to placeholder
    setImgSrc('/placeholder.svg?height=32&width=32')
  }

  return (
    <Card className="w-full max-w-sm space-y-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Current Stake</CardTitle>
        <img src={imgSrc} onError={handleImgError} alt={`${tokenName} logo`} className="h-8 w-8" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Token</span>
            <span className="font-semibold">{tokenName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Value</span>
            <span className="font-semibold">
              {tokenValue} {tokenName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">ROI</span>
            <span className="font-semibold">{roi}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Start Date</span>
            <span className="font-semibold">{new Date(startDate*1000).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Time until maturity</span>
            <span className="font-semibold">{countdown}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

