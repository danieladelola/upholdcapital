export type Trade = {
  id: string;
  title: string;
  traderId: string;
  traderName: string;
  isTrader: boolean;
  symbol: string;
  entryPrice: string;
  direction: string;
  size: string;
  minStartup: string;
  profitShare: string;
  notes?: string;
  createdAt: string;
  winRate?: number;
  tradesCount?: number;
  wins?: number;
  losses?: number;
  copiedBy?: string[];
};

const STORAGE_KEY = "tradingpro_trades";

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export function getTrades(): Trade[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Trade[];
  } catch (e) {
    console.error("Failed to read trades", e);
    return [];
  }
}

export function saveTrade(partial: Omit<Trade, "id" | "createdAt" | "copiedBy">) {
  const trades = getTrades();
  const id = generateId();
  const createdAt = new Date().toISOString();
  const trade = {
    ...partial,
    id,
    createdAt,
    copiedBy: [],
  } as Trade;

  // ensure some derived fields
  if (!trade.winRate) {
    trade.winRate = Math.floor(Math.random() * (98 - 70 + 1)) + 70;
  }
  if (!trade.tradesCount) {
    trade.tradesCount = Math.floor(Math.random() * 181) + 20; // 20..200
  }
  trade.wins = Math.round((trade.winRate! / 100) * trade.tradesCount);
  trade.losses = trade.tradesCount - (trade.wins ?? 0);

  trades.unshift(trade);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  } catch (e) {
    console.error("Failed to save trade", e);
  }
  return trade;
}

export function updateTrade(updated: Trade) {
  const trades = getTrades();
  const idx = trades.findIndex((t) => t.id === updated.id);
  if (idx === -1) return null;
  trades[idx] = updated;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  } catch (e) {
    console.error("Failed to update trade", e);
  }
  return updated;
}

export function toggleCopy(tradeId: string, userId: string) {
  const trades = getTrades();
  const idx = trades.findIndex((t) => t.id === tradeId);
  if (idx === -1) return null;
  const t = trades[idx];
  t.copiedBy = t.copiedBy || [];
  if (t.copiedBy.includes(userId)) {
    t.copiedBy = t.copiedBy.filter((id) => id !== userId);
  } else {
    t.copiedBy.push(userId);
  }
  trades[idx] = t;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  } catch (e) {
    console.error("Failed to toggle copy", e);
  }
  return t;
}
