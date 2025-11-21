export type Trader = {
  id: string
  name: string
  avatar?: string
  winRate: number
  totalReturn: number
  followers: number
  riskLevel: "Low" | "Medium" | "High"
  isFollowing?: boolean
}

export type CopiedPosition = {
  id: string
  traderId: string
  symbol: string
  entryPrice: number
  currentPrice: number
  unrealizedPnL: number
  direction: "Buy" | "Sell"
  leverage?: string
  timeframe?: string
  status: "open" | "closed"
  date: string
}

export const traders: Trader[] = [
  { id: "t1", name: "Ava Trader", avatar: "/avatars/shadcn.jpg", winRate: 0.72, totalReturn: 1.45, followers: 1240, riskLevel: "Medium", isFollowing: false },
  { id: "t2", name: "Kai Signals", avatar: "/avatars/shadcn.jpg", winRate: 0.81, totalReturn: 2.3, followers: 5400, riskLevel: "Low", isFollowing: true },
  { id: "t3", name: "Zed Swing", avatar: "/avatars/shadcn.jpg", winRate: 0.59, totalReturn: -0.12, followers: 320, riskLevel: "High", isFollowing: false },
]

export let positions: CopiedPosition[] = [
  { id: "p1", traderId: "t2", symbol: "SOL", entryPrice: 85, currentPrice: 92.5, unrealizedPnL: 7.5, direction: "Buy", leverage: "1x", timeframe: "10m", status: "open", date: new Date().toISOString() },
  { id: "p2", traderId: "t1", symbol: "BTC", entryPrice: 34000, currentPrice: 33800, unrealizedPnL: -200, direction: "Sell", leverage: "2x", timeframe: "1h", status: "open", date: new Date(Date.now()-1000*60*30).toISOString() },
]

export const history = [
  { id: "h1", traderId: "t2", symbol: "ETH", entryPrice: 1600, exitPrice: 1700, profit: 100, date: new Date(Date.now()-1000*60*60*24).toISOString() },
]

export function toggleFollow(traderId: string) {
  const t = traders.find((x) => x.id === traderId)
  if (!t) return null
  t.isFollowing = !t.isFollowing
  return t.isFollowing
}

export function copyPosition(pos: CopiedPosition) {
  positions = [pos, ...positions]
  return pos
}

export function closePosition(id: string) {
  const idx = positions.findIndex((p) => p.id === id)
  if (idx === -1) return null
  const [p] = positions.splice(idx, 1)
  return p
}
