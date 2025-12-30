"use client";

import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Check } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { PriceService } from "@/lib/price-service";

interface PostedTrade {
  id: string;
  trader: {
    id: string;
    displayName?: string;
    profileImage?: string;
    firstName?: string;
    lastName?: string;
  };
  asset: {
    id: string;
    name: string;
    symbol: string;
    logoUrl?: string;
    priceUsd: number;
  };
  tradeType: string;
  amount: number;
  entryPrice: number;
  profitShare: number;
  notes?: string;
  duration: number;
  status: string;
  createdAt: string;
}

interface CopyTradingDashboardProps {
  assets: any[];
  balance: number;
  user: any;
}

export default function CopyTradingDashboard({
  assets,
  balance,
  user,
}: CopyTradingDashboardProps) {
  const [selectedTrade, setSelectedTrade] = useState<PostedTrade | null>(null);
  const [copyAmount, setCopyAmount] = useState("");
  const [copying, setCopying] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"top-experts" | "copying" | "how-it-works">("top-experts");
  const [searchTerm, setSearchTerm] = useState("");
  const [postedTrades, setPostedTrades] = useState<PostedTrade[]>([]);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const VISIBLE_COUNT = 60;
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchPostedTrades();
  }, []);

  const fetchPostedTrades = async () => {
    try {
      const res = await fetch('/api/trades/posted');
      if (res.ok) {
        const data = await res.json();
        setPostedTrades(data);
      }
    } catch (error) {
      console.error('Failed to fetch posted trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const [livePrices, setLivePrices] = useState<{ [key: string]: number }>({});

  const fetchLivePrices = async (trades: PostedTrade[]) => {
    try {
      const symbols = [...new Set(trades.map(t => t.asset.symbol))];
      const coinGeckoIds = symbols.map(symbol => PriceService.mapSymbolToCoinGeckoId(symbol));
      
      if (coinGeckoIds.length > 0) {
        const prices = await PriceService.fetchPrices(coinGeckoIds);
        const priceMap: { [key: string]: number } = {};
        
        symbols.forEach((symbol, index) => {
          const coinGeckoId = coinGeckoIds[index];
          priceMap[symbol] = prices[coinGeckoId]?.usd || trades.find(t => t.asset.symbol === symbol)?.asset.priceUsd || 0;
        });
        
        setLivePrices(priceMap);
      }
    } catch (error) {
      console.error('Failed to fetch live prices:', error);
      // Fallback to database prices
      const fallbackPrices: { [key: string]: number } = {};
      trades.forEach(trade => {
        fallbackPrices[trade.asset.symbol] = trade.asset.priceUsd;
      });
      setLivePrices(fallbackPrices);
    }
  };

  useEffect(() => {
    if (postedTrades.length > 0) {
      fetchLivePrices(postedTrades);
      
      // Update prices every 30 seconds
      const interval = setInterval(() => {
        fetchLivePrices(postedTrades);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [postedTrades]);

  const calculatePnL = (trade: PostedTrade) => {
    const currentPrice = livePrices[trade.asset.symbol] || trade.asset.priceUsd;
    const entryPrice = trade.entryPrice;
    if (trade.tradeType === 'buy') {
      return ((currentPrice - entryPrice) / entryPrice) * 100;
    } else {
      return ((entryPrice - currentPrice) / entryPrice) * 100;
    }
  };

  const isTradeActive = (trade: PostedTrade) => {
    if (trade.status !== 'open') return false;
    const createdAt = new Date(trade.createdAt);
    const expiryTime = new Date(createdAt.getTime() + trade.duration * 60 * 60 * 1000);
    return expiryTime > new Date();
  };

  const handleCopyTrade = async () => {
    if (!selectedTrade || !copyAmount) return;
    if (currentUser?.role?.toLowerCase() === 'admin') {
      toast({
        title: "Admins cannot copy trades",
        variant: "destructive",
      });
      return;
    }
    setCopying(true);
    try {
      const res = await fetch('/api/trades/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postedTradeId: selectedTrade.id,
          amount: copyAmount,
        }),
      });
      if (res.ok) {
        const { adjustment } = await res.json();
        toast({
          title: "Trade copied successfully",
          description: `Balance adjusted by $${adjustment.toFixed(2)}`,
        });
        setSelectedTrade(null);
        setCopyAmount("");
      } else {
        const error = await res.json();
        toast({
          title: "Failed to copy trade",
          description: error.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to copy trade:', error);
      toast({
        title: "Failed to copy trade",
        variant: "destructive",
      });
    } finally {
      setCopying(false);
    }
  };

  const filtered = postedTrades
    .filter((t) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        t.trader.displayName?.toLowerCase().includes(q) ||
        t.asset.name.toLowerCase().includes(q) ||
        t.asset.symbol.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const aActive = isTradeActive(a);
      const bActive = isTradeActive(b);
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      // If both active or both inactive, sort by createdAt desc
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const topExperts = filtered;

  const FAQS = [
    { q: "What is Copy Trading?", a: "Copy Trading allows you to follow expert traders." },
    { q: "How do I copy an expert?", a: "Click the Copy button beside any expert." },
    { q: "How can I stop copying?", a: "Click Cancel on the expert you are copying." },
    { q: "Why don't I receive any trades?", a: "They may not have placed new trades yet." },
    { q: "What is the minimum amount?", a: "Each expert sets their minimum amount." },
    { q: "How does copying work?", a: "Your trades follow the expert settings." },
    { q: "What is profit share?", a: "It's the percent the expert earns from your profits." },
    { q: "How to stop copying?", a: "Open the expert and press Cancel." },
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6 md:p-10">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Copy Trading</h1>
          <p className="text-sm text-gray-600">
            Browse public trades and copy traders you trust.
          </p>
        </div>
        {/* Display balance if needed */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Your Balance</p>
            <p className="text-2xl font-semibold">${balance.toFixed(2)}</p>
          </div>
          {(currentUser?.role?.toLowerCase() === 'admin' || currentUser?.role?.toLowerCase() === 'trader') && (
            <Link href="/dashboard/post-trade">
              <button className="px-4 py-2 bg-black text-white rounded">Post Trade</button>
            </Link>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="mb-4 border-b">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab("top-experts")}
            className={`pb-2 ${
              activeTab === "top-experts"
                ? "border-b-2 border-blue-500 font-semibold"
                : "text-gray-600"
            }`}
          >
            Top Experts
          </button>
          <button
            onClick={() => setActiveTab("copying")}
            className={`pb-2 ${
              activeTab === "copying"
                ? "border-b-2 border-blue-500 font-semibold"
                : "text-gray-600"
            }`}
          >
            Copying
          </button>
          <button
            onClick={() => setActiveTab("how-it-works")}
            className={`pb-2 ${
              activeTab === "how-it-works"
                ? "border-b-2 border-blue-500 font-semibold"
                : "text-gray-600"
            }`}
          >
            How it works
          </button>
        </nav>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative">
          <input
            className="pl-9 pr-3 py-2 rounded border w-64"
            placeholder="Search trades or traders"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-2 text-gray-400">
            <Search size={16} />
          </div>
        </div>
      </div>

      {/* TOP EXPERTS */}
      {activeTab === "top-experts" && (
        <div>
          {topExperts.length === 0 && (
            <div className="text-gray-600">No trades found.</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topExperts
              .slice(0, showAll ? topExperts.length : VISIBLE_COUNT)
              .map((t) => (
                <div
                  key={t.id}
                  className={`bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 flex flex-col rounded-xl p-6 overflow-hidden cursor-pointer ${!isTradeActive(t) ? 'border-gray-300' : ''}`}
                  onClick={() => isTradeActive(t) ? setSelectedTrade(t) : undefined}
                >
                  {/* TRADER INFO */}
                  <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="relative mr-3">
                      {t.trader.profileImage ? (
                        <img
                          src={t.trader.profileImage}
                          alt="avatar"
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
                          {(t.trader.displayName || t.trader.firstName || 'U')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {t.trader.displayName || t.trader.firstName || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">Expert Trader</div>
                    </div>
                  </div>

                  {/* ASSET INFO */}
                  <div className="flex items-center justify-center mb-4 p-3 bg-blue-50 rounded-lg">
                    {t.asset.logoUrl && (
                      <img
                        src={t.asset.logoUrl}
                        alt={t.asset.name}
                        className="w-8 h-8 mr-3"
                      />
                    )}
                    <div className="text-center">
                      <div className="font-bold text-gray-900">{t.asset.name}</div>
                      <div className="text-sm text-gray-600">{t.asset.symbol}</div>
                    </div>
                  </div>

                  {/* TRADE DETAILS */}
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-gray-500 text-xs">Trade Type</div>
                        <div className="font-semibold capitalize text-gray-900">{t.tradeType}</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-gray-500 text-xs">Profit Share</div>
                        <div className="font-semibold text-gray-900">{t.profitShare}%</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-green-50 p-2 rounded">
                        <div className="text-gray-500 text-xs">Entry Price</div>
                        <div className="font-semibold text-green-700">${t.entryPrice.toFixed(2)}</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="text-gray-500 text-xs">Current Price</div>
                        <div className="font-semibold text-blue-700">${(livePrices[t.asset.symbol] || t.asset.priceUsd).toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">P/L</span>
                        <span className={`font-bold text-sm ${calculatePnL(t) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {calculatePnL(t) >= 0 ? '+' : ''}{calculatePnL(t).toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Status: {t.status} | Duration: {t.duration}h | Posted {new Date(t.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* BUTTON */}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <button
                      className={`w-full py-3 px-4 font-semibold rounded-lg transition-all duration-200 transform shadow-sm hover:shadow-md ${
                        isTradeActive(t)
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-[1.02]'
                          : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      }`}
                      disabled={!isTradeActive(t)}
                      onClick={(e) => {
                        if (isTradeActive(t)) {
                          e.stopPropagation();
                          setSelectedTrade(t);
                        }
                      }}
                    >
                      {isTradeActive(t) ? 'Copy Trade' : 'Closed trade'}
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {topExperts.length > VISIBLE_COUNT && (
            <div className="mt-6 text-center">
              <button
                className="px-4 py-2 border rounded text-sm bg-white"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll
                  ? "View less"
                  : `View more (${topExperts.length - VISIBLE_COUNT} more)`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* COPYING HISTORY */}
      {activeTab === "copying" && (
        <div className="text-gray-600">
          Copying history not implemented yet.
        </div>
      )}

      {/* HOW IT WORKS */}
      {activeTab === "how-it-works" && (
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="border rounded">
              <button
                className="w-full text-left p-3 flex justify-between items-center"
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
              >
                <span className="font-medium">{f.q}</span>
                <span className="text-gray-500">
                  {openFAQ === i ? "-" : "+"}
                </span>
              </button>

              {openFAQ === i && (
                <div className="p-3 text-sm text-gray-600 border-t">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* COPY TRADE DIALOG */}
      <Dialog
        open={!!selectedTrade}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTrade(null);
            setCopyAmount("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Copy Trade</DialogTitle>
          </DialogHeader>
          {selectedTrade && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <div className="flex items-center mb-2">
                  {selectedTrade.asset.logoUrl && (
                    <img
                      src={selectedTrade.asset.logoUrl}
                      alt={selectedTrade.asset.name}
                      className="w-6 h-6 mr-2"
                    />
                  )}
                  <span className="font-semibold">{selectedTrade.asset.name} ({selectedTrade.asset.symbol})</span>
                </div>
                <div>Trader: {selectedTrade.trader.displayName || selectedTrade.trader.firstName}</div>
                <div>Trade Type: {selectedTrade.tradeType.toUpperCase()}</div>
                <div>Entry Price: ${selectedTrade.entryPrice.toFixed(2)}</div>
                <div>Current Price: ${(livePrices[selectedTrade.asset.symbol] || selectedTrade.asset.priceUsd).toFixed(2)}</div>
                <div>Profit Share: {selectedTrade.profitShare}%</div>
                <div>Notes: {selectedTrade.notes || 'None'}</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Your Trade Amount</label>
                <Input
                  type="number"
                  value={copyAmount}
                  onChange={(e) => setCopyAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setSelectedTrade(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCopyTrade}
                  disabled={copying || !copyAmount}
                  className="flex-1"
                >
                  {copying ? "Copying..." : "Confirm Copy"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}