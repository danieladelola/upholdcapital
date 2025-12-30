"use client"

import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from 'next/navigation';
import { PriceService } from "@/lib/price-service";

interface Asset {
  id: string;
  name: string;
  symbol: string;
  logoUrl?: string;
  priceUsd: number;
  balance: number;
}

export default function PostTrade() {
  const { user } = useAuth();
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [priceLoading, setPriceLoading] = useState(false);
  const [tradeType, setTradeType] = useState("buy");
  const [amount, setAmount] = useState("");
  const [profitShare, setProfitShare] = useState("20");
  const [duration, setDuration] = useState("24");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [canPost, setCanPost] = useState(false);
  const [myTrades, setMyTrades] = useState<any[]>([]);
  const [closing, setClosing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const hasPermission = user.role?.toLowerCase() === 'trader' || user.role?.toLowerCase() === 'admin';
    setCanPost(hasPermission);
    if (!hasPermission) {
      router.push('/dashboard/home');
    }
  }, [user, router]);

  useEffect(() => {
    if (canPost) {
      fetchTraderAssets();
      fetchMyTrades();
    }
  }, [canPost]);

  const fetchTraderAssets = async () => {
    try {
      const res = await fetch('/api/user/trader-assets');
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    }
  };

  const fetchMyTrades = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch('/api/trades/my-posted');
      if (res.ok) {
        const data = await res.json();
        setMyTrades(data);
      }
    } catch (error) {
      console.error('Failed to fetch my trades:', error);
    }
  };

  const fetchLivePrice = async (asset: Asset) => {
    setPriceLoading(true);
    try {
      const coinGeckoId = PriceService.mapSymbolToCoinGeckoId(asset.symbol);
      const livePrice = await PriceService.fetchPrice(coinGeckoId);
      
      if (livePrice > 0) {
        setCurrentPrice(livePrice);
        setEntryPrice(livePrice); // Set entry price when asset is selected
      } else {
        // Fallback to database price if API fails
        setCurrentPrice(asset.priceUsd);
        setEntryPrice(asset.priceUsd);
      }
    } catch (error) {
      console.error('Failed to fetch live price:', error);
      // Fallback to database price
      setCurrentPrice(asset.priceUsd);
      setEntryPrice(asset.priceUsd);
    } finally {
      setPriceLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAsset) {
      const asset = assets.find(a => a.id === selectedAsset);
      if (asset) {
        fetchLivePrice(asset);
      }
    }
  }, [selectedAsset, assets]);

  // Auto update current price every 30 seconds
  useEffect(() => {
    if (!selectedAsset) return;
    
    const interval = setInterval(async () => {
      const asset = assets.find(a => a.id === selectedAsset);
      if (asset) {
        try {
          const coinGeckoId = PriceService.mapSymbolToCoinGeckoId(asset.symbol);
          const livePrice = await PriceService.fetchPrice(coinGeckoId);
          if (livePrice > 0) {
            setCurrentPrice(livePrice);
          }
        } catch (error) {
          console.error('Failed to update live price:', error);
        }
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [selectedAsset, assets]);

  const traderName = user?.displayName || user?.firstname || user?.email || "Unknown";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.id || !selectedAsset || !amount || !profitShare) return alert("Please fill all required fields.");
    if (!canPost) return alert("You do not have permission to post trades.");
    setSubmitting(true);
    try {
      console.log('Submitting trade with data:', {
        assetId: selectedAsset,
        tradeType,
        amount,
        profitShare,
        notes,
        entryPrice,
        duration: parseInt(duration),
      });

      const res = await fetch('/api/trades/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: selectedAsset,
          tradeType,
          amount,
          profitShare,
          notes,
          entryPrice, // Send the live entry price
          duration: parseInt(duration),
        }),
      });

      console.log('API response status:', res.status);

      if (res.ok) {
        alert("Trade posted successfully");
        setSelectedAsset("");
        setAmount("");
        setProfitShare("20");
        setNotes("");
        fetchMyTrades(); // Refresh the list
      } else {
        const error = await res.json();
        console.error('API error:', error);
        alert(`Failed to post trade: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Network error:', err);
      alert("Failed to post trade - network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTrade = async (tradeId: string) => {
    setClosing(tradeId);
    try {
      const res = await fetch('/api/trades/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId }),
      });
      if (res.ok) {
        alert("Trade closed successfully");
        fetchMyTrades(); // Refresh the list
      } else {
        const error = await res.json();
        alert(error.error || "Failed to close trade");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to close trade");
    } finally {
      setClosing(null);
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    if (!confirm("Are you sure you want to delete this trade? This action cannot be undone.")) return;
    setDeleting(tradeId);
    try {
      const res = await fetch('/api/trades/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId }),
      });
      if (res.ok) {
        alert("Trade deleted successfully");
        fetchMyTrades(); // Refresh the list
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete trade");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete trade");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-3xl bg-white p-6 rounded shadow-sm">
      <h1 className="text-2xl font-semibold mb-2">Post Trade</h1>
      <p className="text-sm text-gray-600 mb-4">Share a trade for copy trading. Only users with a trader role can post.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Asset</label>
          <select
            className="w-full p-2 rounded border"
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            required
          >
            <option value="">Select Asset</option>
            {assets.map(asset => (
              <option key={asset.id} value={asset.id}>
                {asset.name} ({asset.symbol}) - Balance: {asset.balance}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Trade Type</label>
          <select className="w-full p-2 rounded border" value={tradeType} onChange={(e) => setTradeType(e.target.value)}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Trade Amount</label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 500" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Profit Share (%)</label>
            <select value={profitShare} onChange={(e) => setProfitShare(e.target.value)} className="w-full p-2 rounded border">
              {Array.from({ length: 20 }).map((_, i) => {
                const pct = (i + 1) * 5; // 5,10,...,100
                const label = `${pct}`;
                return (
                  <option key={pct} value={label}>{label}%</option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full p-2 rounded border">
              <option value="1">1 Hour</option>
              <option value="6">6 Hours</option>
              <option value="24">1 Day</option>
              <option value="72">3 Days</option>
              <option value="168">1 Week</option>
              <option value="720">1 Month</option>
            </select>
          </div>
        </div>

        {selectedAsset && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Entry Price</div>
              <div className="text-lg font-semibold text-green-600">
                {priceLoading ? 'Loading...' : `$${entryPrice.toFixed(2)}`}
              </div>
              <div className="text-xs text-gray-500">Price at post time</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Current Price</div>
              <div className="text-lg font-semibold text-blue-600">
                {priceLoading ? 'Loading...' : `$${currentPrice.toFixed(2)}`}
              </div>
              <div className="text-xs text-gray-500">Live market price</div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2 rounded border" rows={4} />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Posting as <span className="font-medium">{traderName}</span>
            <span className="inline-block ml-2 align-middle text-blue-500">{canPost ? '✔' : ''}</span>
          </div>
          <Button type="submit" disabled={submitting || !canPost}>
            {submitting ? "Posting..." : "Post Trade"}
          </Button>
        </div>
      </form>

      {/* Manage Trades Section */}
      {myTrades.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6">My Posted Trades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTrades.map((trade) => (
              <div key={trade.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl p-6 overflow-hidden">
                {/* ASSET INFO */}
                <div className="flex items-center justify-center mb-4 p-3 bg-blue-50 rounded-lg">
                  {trade.asset.logoUrl && (
                    <img
                      src={trade.asset.logoUrl}
                      alt={trade.asset.name}
                      className="w-8 h-8 mr-3"
                    />
                  )}
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{trade.asset.name}</div>
                    <div className="text-sm text-gray-600">{trade.asset.symbol}</div>
                  </div>
                </div>

                {/* TRADE DETAILS */}
                <div className="space-y-3 mb-6">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-500 text-xs">Trade Type</div>
                      <div className="font-semibold capitalize text-gray-900">{trade.tradeType}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-500 text-xs">Profit Share</div>
                      <div className="font-semibold text-gray-900">{trade.profitShare}%</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-green-50 p-2 rounded">
                      <div className="text-gray-500 text-xs">Amount</div>
                      <div className="font-semibold text-green-700">${trade.amount}</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="text-gray-500 text-xs">Duration</div>
                      <div className="font-semibold text-blue-700">{trade.duration}h</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Status</span>
                      <span className={`font-bold text-sm ${
                        trade.status === 'open' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trade.status === 'open' ? 'Active' : 'Closed'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Posted {new Date(trade.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="space-y-2">
                  {trade.status === 'open' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCloseTrade(trade.id)}
                        disabled={closing === trade.id}
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                      >
                        {closing === trade.id ? "Closing..." : "Close Trade"}
                      </Button>
                      <Button
                        onClick={() => handleDeleteTrade(trade.id)}
                        disabled={deleting === trade.id}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                      >
                        {deleting === trade.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  )}
                  {trade.status !== 'open' && (
                    <Button
                      onClick={() => handleDeleteTrade(trade.id)}
                      disabled={deleting === trade.id}
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    >
                      {deleting === trade.id ? "Deleting..." : "Delete"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
