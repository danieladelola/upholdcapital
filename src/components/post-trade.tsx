"use client"

import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface Asset {
  id: string;
  name: string;
  symbol: string;
  logoUrl?: string;
  priceUsd: number;
}

interface Trader {
  id: string;
  username: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
}

export default function PostTrade() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [selectedTrader, setSelectedTrader] = useState<string>("");
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [profit, setProfit] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      return;
    }
    fetchAssets();
    fetchTraders();
    setLoading(false);
  }, [user]);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrader || !selectedAsset || !date || !size || !profit) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/trades/admin-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traderId: selectedTrader,
          assetId: selectedAsset,
          date,
          size,
          profit,
        }),
      });

      if (res.ok) {
        toast({
          title: "Trade posted successfully",
        });
        // Reset form
        setSelectedTrader("");
        setSelectedAsset("");
        setDate("");
        setSize("");
        setProfit("");
      } else {
        const error = await res.json();
        toast({
          title: "Failed to post trade",
          description: error.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to post trade:', error);
      toast({
        title: "Failed to post trade",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (user?.role !== 'admin') {
    return <div>You do not have permission to access this page.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Post Trade for Trader</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Trader</label>
          <Select value={selectedTrader} onValueChange={setSelectedTrader}>
            <SelectTrigger>
              <SelectValue placeholder="Select a trader" />
            </SelectTrigger>
            <SelectContent>
              {traders.map((trader) => (
                <SelectItem key={trader.id} value={trader.id}>
                  {trader.displayName || trader.firstName || trader.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Asset</label>
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger>
              <SelectValue placeholder="Select an asset" />
            </SelectTrigger>
            <SelectContent>
              {assets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.name} ({asset.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Size</label>
          <Input
            type="number"
            step="0.01"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="Enter trade size"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Profit</label>
          <Input
            type="number"
            step="0.01"
            value={profit}
            onChange={(e) => setProfit(e.target.value)}
            placeholder="Enter profit amount"
            required
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Posting..." : "Post Trade"}
        </Button>
      </form>
    </div>
  );
}
