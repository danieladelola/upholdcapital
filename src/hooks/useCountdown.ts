import { useState, useEffect } from "react"
import { formatCountdown } from "../utils/formatCountdown"

export function useCountdown(targetDate: Date) {
  const [countdown, setCountdown] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance < 0) {
        clearInterval(interval)
        setCountdown("Matured")
      } else {
        setCountdown(formatCountdown(Math.floor(distance / 1000)))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  return countdown
}

