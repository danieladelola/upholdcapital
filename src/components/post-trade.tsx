"use client"

import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import { hasPermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { saveTrade } from "@/lib/trades";

export default function PostTrade() {
  const { user } = useUser();
  // Title and Symbol removed from UI (kept out of form). We'll provide sensible defaults on submit.
  // Entry Price removed from form and state
  const [direction, setDirection] = useState("Buy");
  const [size, setSize] = useState("");
  const [minStartup, setMinStartup] = useState("");
  const [profitShare, setProfitShare] = useState("20%");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [canPost, setCanPost] = useState(false);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const ok = await hasPermission(user.id, PERMISSIONS.POST_TRADE);
      setCanPost(!!ok);
    };
    check();
  }, [user]);

  const traderName = user?.fullName || user?.firstName || user?.emailAddresses?.[0]?.emailAddress || "Unknown";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please sign in to post trades.");
    if (!canPost) return alert("You do not have permission to post trades.");
    setSubmitting(true);
    try {
      const trade = saveTrade({
        // Title and symbol removed from UI — provide defaults so storage shape remains stable
        title: `${traderName} trade`,
        traderId: user.id,
        traderName,
        isTrader: true,
        symbol: "",
        // entryPrice removed
        direction,
        size,
        minStartup,
        profitShare,
        notes,
      });

      alert("Trade posted");
      // clear form (leave defaults)
      // setEntryPrice removed
      setSize("");
      setMinStartup("");
      setProfitShare("20%");
      setNotes("");
    } catch (err) {
      console.error(err);
      alert("Failed to post trade");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl bg-white p-6 rounded shadow-sm">
      <h1 className="text-2xl font-semibold mb-2">Post Trade</h1>
      <p className="text-sm text-gray-600 mb-4">Share a trade for copy trading. Only users with a trader role can post.</p>

      {!canPost && (
        <div className="mb-4 text-sm text-red-600">You do not have permission to post trades.</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">


        <div>
          <label className="block text-sm font-medium mb-1">Direction</label>
          <select className="w-full p-2 rounded border" value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option>Buy</option>
            <option>Sell</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Size</label>
            <Input value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. 0.1 BTC" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Min. Startup</label>
            <Input value={minStartup} onChange={(e) => setMinStartup(e.target.value)} placeholder="e.g. $100" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Profit Share</label>
            <select value={profitShare} onChange={(e) => setProfitShare(e.target.value)} className="w-full p-2 rounded border">
              {Array.from({ length: 20 }).map((_, i) => {
                const pct = (i + 1) * 5; // 5,10,...,100
                const label = `${pct}%`;
                return (
                  <option key={pct} value={label}>{label}</option>
                );
              })}
            </select>
          </div>
        </div>

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
    </div>
  );
}
