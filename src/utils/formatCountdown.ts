export function formatCountdown(timeLeft: number): string {
    const days = Math.floor(timeLeft / (24 * 60 * 60))
    const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((timeLeft % (60 * 60)) / 60)
    const seconds = timeLeft % 60
  
    return `${days}d ${hours}h ${minutes}m ${seconds}s`
  }
  
  