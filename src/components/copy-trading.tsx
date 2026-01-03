"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, TrendingUp, DollarSign, CheckCircle, XCircle, BarChart3, Users, BadgeCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Trader {
  id: string;
  username: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  winRate?: number;
  followers?: number;
  wins?: number;
  losses?: number;
  traderTrades?: number;
  minStartup?: number;
}

interface TraderTrade {
  id: string;
  date: string;
  size: number;
  profit: number;
  asset: {
    id: string;
    name: string;
    symbol: string;
  };
}

interface CopyTradingDashboardProps {
  balance: number;
}

const cardBackgrounds = [
  "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
  "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
  "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
  "bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20",
  "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20",
  "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20",
  "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
  "bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20",
];

function TraderCard({ 
  trader, 
  isCopied, 
  onCopy,
  index 
}: { 
  trader: Trader; 
  isCopied: boolean; 
  onCopy: () => void;
  index: number;
}) {
  const [flipped, setFlipped] = useState(false);
  const [trades, setTrades] = useState<TraderTrade[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(false);

  const fetchTrades = async () => {
    setLoadingTrades(true);
    try {
      const res = await fetch(`/api/traders/${trader.id}/trades`);
      if (res.ok) {
        const data = await res.json();
        setTrades(data);
      }
    } catch (error) {
      console.error('Failed to fetch trades:', error);
    } finally {
      setLoadingTrades(false);
    }
  };

  const handleView = () => {
    setFlipped(true);
    fetchTrades();
  };

  const handleBack = () => {
    setFlipped(false);
  };

  const cardStyle = {
    perspective: '1000px',
  };

  const innerStyle = {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    textAlign: 'center' as const,
    transition: 'transform 0.6s',
    transformStyle: 'preserve-3d' as const,
    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  };

  const faceStyle = {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden' as const,
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column' as const,
  };

  const backStyle = {
    ...faceStyle,
    transform: 'rotateY(180deg)',
  };

  return (
    <div style={cardStyle} className="h-full transform transition-transform duration-300 hover:scale-105 hover:-translate-y-2">
      <div style={innerStyle}>
        <div style={faceStyle}>
          <Card className={`h-full flex flex-col shadow-2xl border-2 border-gray-200/50 rounded-lg ${cardBackgrounds[index % cardBackgrounds.length]}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {/* Profile Picture */}
                {trader.profileImage ? (
                  <img
                    src={trader.profileImage}
                    alt={trader.displayName || trader.username}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-lg text-xl">
                    {(trader.displayName || trader.firstName || trader.username || 'U')[0].toUpperCase()}
                  </div>
                )}

                {/* Name, Username, and Followers */}
                <div>
                  <CardTitle className="text-lg flex items-center gap-1">
                    {trader.firstName} {trader.lastName}
                    <BadgeCheck className="w-4 h-4 text-blue-500" />
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">@{trader.username}</p>
                  <p className="text-sm text-muted-foreground">{(trader.followers || 0) > 9999 ? `${Math.floor((trader.followers || 0) / 1000)}k` : (trader.followers || 0)} followers</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 rounded-lg shadow-inner">
                  <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-500" />
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                  <div className="font-semibold">{trader.winRate ? `${trader.winRate}%` : 'N/A'}</div>
                </div>
                <div className="text-center p-2 rounded-lg shadow-inner">
                  <DollarSign className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                  <div className="text-xs text-muted-foreground">Profit Share</div>
                  <div className="font-semibold">20%</div>
                </div>
                <div className="text-center p-2 rounded-lg shadow-inner">
                  <CheckCircle className="w-4 h-4 mx-auto mb-1 text-green-500" />
                  <div className="text-xs text-muted-foreground">Wins</div>
                  <div className="font-semibold">{trader.wins || 0}</div>
                </div>
                <div className="text-center p-2 rounded-lg shadow-inner">
                  <XCircle className="w-4 h-4 mx-auto mb-1 text-red-500" />
                  <div className="text-xs text-muted-foreground">Losses</div>
                  <div className="font-semibold">{trader.losses || 0}</div>
                </div>
                <div className="text-center p-2 rounded-lg shadow-inner">
                  <BarChart3 className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                  <div className="text-xs text-muted-foreground">Trades</div>
                  <div className="font-semibold">{trader.traderTrades || 0}</div>
                </div>
                <div className="text-center p-2 rounded-lg shadow-inner">
                  <DollarSign className="w-4 h-4 mx-auto mb-1 text-green-500" />
                  <div className="text-xs text-muted-foreground">Min Startup</div>
                  <div className="font-semibold">${trader.minStartup || 0}</div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              {/* Buttons */}
              <div className="flex gap-1 w-full">
                <Button variant="outline" className="flex-1 shadow-md" onClick={handleView}>
                  View
                </Button>
                <Button className="flex-1 shadow-md" onClick={onCopy}>
                  {isCopied ? 'Close' : 'Copy'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div style={backStyle}>
          <Card className={`h-full flex flex-col shadow-2xl border-2 border-gray-200/50 rounded-lg ${cardBackgrounds[index % cardBackgrounds.length]}`}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{trader.displayName || trader.firstName || trader.username}'s Trades</CardTitle>
                <Button variant="outline" className="shadow-md" onClick={handleBack}>
                  Back
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {loadingTrades ? (
                <div className="text-center text-muted-foreground">Loading trades...</div>
              ) : trades.length === 0 ? (
                <div className="text-center text-muted-foreground">No trades available</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Asset</th>
                        <th className="text-left p-2">Size</th>
                        <th className="text-left p-2">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((trade) => (
                        <tr key={trade.id} className="border-b hover:bg-muted">
                          <td className="p-2">{new Date(trade.date).toLocaleDateString()}</td>
                          <td className="p-2">{trade.asset.name} ({trade.asset.symbol})</td>
                          <td className="p-2">{trade.size.toFixed(2)}</td>
                          <td className="p-2 font-semibold" style={{ color: trade.profit >= 0 ? 'green' : 'red' }}>${trade.profit.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const FAQS = [
  { q: "What is Copy Trading?", a: "Copy Trading allows you to follow expert traders and automatically copy their trades." },
  { q: "How do I copy an expert?", a: "Click the Copy button beside any trader card to start copying their trades." },
  { q: "How can I stop copying?", a: "Click the Close button on the trader card you are copying." },
  { q: "Why don't I receive any trades?", a: "They may not have placed new trades yet. Check back later." },
  { q: "What is the minimum amount?", a: "Each trader sets their own minimum startup amount." },
  { q: "How does copying work?", a: "Your trades follow the expert's trading decisions and strategies." },
  { q: "What is profit share?", a: "It's the percentage the trader earns from your profits." },
  { q: "How to stop copying?", a: "Open the trader card and click the Close button." },
];

export default function CopyTradingDashboard({ balance }: CopyTradingDashboardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [traders, setTraders] = useState<Trader[]>([]);
  const [copiedTrades, setCopiedTrades] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"top-experts" | "copying" | "how-it-works">("top-experts");
  const [searchTerm, setSearchTerm] = useState("");
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchTraders(),
        fetchCopiedTrades(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchTraders = async () => {
    try {
      const res = await fetch('/api/users/traders');
      if (res.ok) {
        const data = await res.json();
        setTraders(data);
      }
    } catch (error) {
      console.error('Failed to fetch traders:', error);
    }
  };

  const fetchCopiedTrades = async () => {
    try {
      const res = await fetch('/api/copied-trades');
      if (res.ok) {
        const data = await res.json();
        const copiedMap: { [key: string]: boolean } = {};
        data.forEach((ct: any) => {
          copiedMap[ct.traderId] = true;
        });
        setCopiedTrades(copiedMap);
      }
    } catch (error) {
      console.error('Failed to fetch copied trades:', error);
    }
  };

  const handleCopyTrader = async (trader: Trader) => {
    if (copiedTrades[trader.id]) {
      // Stop copying
      try {
        const res = await fetch('/api/copied-trades', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ traderId: trader.id }),
        });
        if (res.ok) {
          setCopiedTrades(prev => ({ ...prev, [trader.id]: false }));
          toast({ title: "Stopped copying trader" });
        }
      } catch (error) {
        console.error('Failed to stop copying:', error);
        toast({ title: "Failed to stop copying", variant: "destructive" });
      }
    } else {
      // Start copying
      try {
        const res = await fetch('/api/copied-trades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ traderId: trader.id }),
        });
        if (res.ok) {
          setCopiedTrades(prev => ({ ...prev, [trader.id]: true }));
          toast({ title: "Started copying trader" });
        } else {
          const error = await res.json();
          toast({ title: error.error || "Failed to copy", variant: "destructive" });
        }
      } catch (error) {
        console.error('Failed to copy trader:', error);
        toast({ title: "Failed to copy trader", variant: "destructive" });
      }
    }
  };

  const filteredTraders = traders.filter(trader => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      trader.displayName?.toLowerCase().includes(q) ||
      trader.username.toLowerCase().includes(q) ||
      trader.firstName?.toLowerCase().includes(q)
    );
  });

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Copy Trading</h1>
          <p className="text-muted-foreground">
            Browse traders and copy those you trust.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Your Balance</p>
          <p className="text-2xl font-semibold">${balance.toFixed(2)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab("top-experts")}
            className={`pb-2 font-medium transition-colors ${
              activeTab === "top-experts"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Top Experts
          </button>
          <button
            onClick={() => setActiveTab("copying")}
            className={`pb-2 font-medium transition-colors ${
              activeTab === "copying"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Copying
          </button>
          <button
            onClick={() => setActiveTab("how-it-works")}
            className={`pb-2 font-medium transition-colors ${
              activeTab === "how-it-works"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            How it works
          </button>
        </nav>
      </div>

      {/* Search */}
      {activeTab === "top-experts" && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search traders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
            />
          </div>
        </div>
      )}

      {/* Top Experts Tab */}
      {activeTab === "top-experts" && (
        <div>
          {filteredTraders.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No traders found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTraders.map((trader, index) => (
                <TraderCard
                  key={trader.id}
                  trader={trader}
                  isCopied={copiedTrades[trader.id] || false}
                  onCopy={() => handleCopyTrader(trader)}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Copying Tab */}
      {activeTab === "copying" && (
        <div>
          {Object.entries(copiedTrades).filter(([_, isCopied]) => isCopied).length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              You are not copying any traders yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {traders
                .filter(t => copiedTrades[t.id])
                .map((trader, index) => (
                  <TraderCard
                    key={trader.id}
                    trader={trader}
                    isCopied={true}
                    onCopy={() => handleCopyTrader(trader)}
                    index={index}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* How it Works Tab */}
      {activeTab === "how-it-works" && (
        <div className="max-w-2xl space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden">
              <button
                className="w-full text-left p-4 flex justify-between items-center hover:bg-muted transition-colors"
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
              >
                <span className="font-medium">{faq.q}</span>
                <span className="text-muted-foreground">
                  {openFAQ === i ? "−" : "+"}
                </span>
              </button>
              {openFAQ === i && (
                <div className="p-4 border-t border-border bg-muted text-foreground">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}