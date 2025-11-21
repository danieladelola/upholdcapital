"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Check } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { getTrades, toggleCopy } from "@/lib/trades";
import type { Asset, UserProfile } from "types"; // Import project root types for compatibility

type TradeCard = {
  id: string;
  title: string;
  name?: string;
  traderName: string;
  avatarUrl?: string;
  isTrader: boolean;
  winRate?: number;
  tradesCount?: number;
  wins?: number;
  losses?: number;
  profitShare?: string;
  minStartup?: string;
  copiedBy?: string[];
};

interface CopyTradingDashboardProps {
  assets: Asset[];
  balance: number;
  user: any;
}

export default function CopyTradingDashboard({
  assets,
  balance,
  user,
}: CopyTradingDashboardProps) {
  const [selectedTrader, setSelectedTrader] = useState<TradeCard | null>(null);
  const [modalTab, setModalTab] = useState<"stats" | "trades">("stats");
  const { toast } = useToast();
  const { user: clerkUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] =
    useState<"top-experts" | "copying" | "how-it-works">("top-experts");
  const [searchTerm, setSearchTerm] = useState("");
  const [trades, setTrades] = useState<TradeCard[]>([]);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const VISIBLE_COUNT = 60;
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!clerkUser) return;
    const items = getTrades();
    setTrades(items);
    setLoading(false);
  }, [clerkUser]);

  const handleToggleCopy = (tradeId: string) => {
    if (!clerkUser) return;
    const updated = toggleCopy(tradeId, clerkUser.id);
    if (!updated) return;

    setTrades((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );

    if (updated.copiedBy?.includes(clerkUser.id)) {
      toast({
        title: "Expert copied successfully",
        description: "",
        duration: 3000,
        style: { background: "#22c55e", color: "white" },
      });
    } else {
      toast({
        title: "Copying cancelled successfully",
        description: "",
        duration: 3000,
        style: { background: "#ef4444", color: "white" },
      });
    }
  };

  const filtered = trades.filter((t) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      t.title?.toLowerCase().includes(q) ||
      t.traderName?.toLowerCase().includes(q) ||
      t.id?.toLowerCase().includes(q)
    );
  });

  const topExperts = filtered;
  const copyingHistory = trades.filter(
    (t) => t.copiedBy && clerkUser && t.copiedBy.includes(clerkUser.id)
  );

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
        <div className="text-right">
          <p className="text-sm text-gray-600">Your Balance</p>
          <p className="text-2xl font-semibold">${balance.toFixed(2)}</p>
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
                  className="bg-white border shadow-lg flex flex-col rounded-[2rem] p-6"
                  style={{ height: "338px" }}
                >
                  {/* AVATAR */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-2">
                      {t.avatarUrl ? (
                        <img
                          src={t.avatarUrl}
                          alt="avatar"
                          className="w-16 h-16 rounded-full object-cover border-4 border-blue-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-700 border-4 border-blue-100">
                          {(t.name || t.traderName)?.split(" ")[0][0]}
                        </div>
                      )}
                    </div>

                    <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      {(t.name || t.traderName || t.title)?.split(" ")[0]}
                      {t.isTrader && (
                        <span className="text-blue-500">
                          <Check size={18} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* STATS */}
                  <div className="flex justify-between gap-4 mb-6 text-sm">
                    <div className="space-y-1 text-gray-600">
                      <div>
                        Win rate:
                        <span className="font-semibold text-gray-900">
                          {t.winRate ?? 0}%
                        </span>
                      </div>
                      <div>
                        Losses:
                        <span className="font-semibold text-gray-900">
                          {t.losses ?? 0}
                        </span>
                      </div>
                      <div>
                        Trades:
                        <span className="font-semibold text-gray-900">
                          {t.tradesCount ?? 0}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-gray-600">
                      <div>
                        Profit share:
                        <span className="font-semibold text-gray-900">
                          {t.profitShare ?? "—"}
                        </span>
                      </div>
                      <div>
                        Wins:
                        <span className="font-semibold text-gray-900">
                          {t.wins ?? 0}
                        </span>
                      </div>
                      <div>
                        Min. startup:
                        <span className="font-semibold text-gray-900">
                          {t.minStartup ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BUTTONS */}
                  <div className="flex justify-center items-center gap-4 mt-auto">
                    <button
                      className="px-7 py-3 rounded-xl border-2 border-white bg-gray-900 text-white font-semibold"
                      onClick={() => {
                        setSelectedTrader(t);
                        setModalTab("stats");
                      }}
                    >
                      View
                    </button>
                    <button
                      className={`px-8 py-3 rounded-xl text-white font-semibold ${
                        t.copiedBy?.includes(clerkUser?.id || "")
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      onClick={() => handleToggleCopy(t.id)}
                    >
                      {t.copiedBy?.includes(clerkUser?.id || "")
                        ? "Cancel"
                        : "Copy"}
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
        <div className="grid gap-4">
          {copyingHistory.length === 0 && (
            <div className="text-gray-600">You are not copying anyone.</div>
          )}

          {copyingHistory.map((t) => (
            <div
              key={t.id}
              className="p-4 bg-white border rounded shadow-sm flex items-center justify-between"
            >
              <div>
                <div className="text-sm text-gray-500">{t.title}</div>
                <div className="text-lg font-medium">
                  {t.traderName?.split(" ")[0]}{" "}
                  {t.isTrader && (
                    <span className="text-blue-500 inline-block ml-1">✔</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border rounded text-sm">
                  View
                </button>
                <button
                  className="px-3 py-1 rounded text-sm bg-red-100 border-red-300"
                  onClick={() => handleToggleCopy(t.id)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
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

      {/* MODAL */}
      <Dialog
        open={!!selectedTrader}
        onOpenChange={(open) => {
          if (!open) setSelectedTrader(null);
        }}
      >
        <DialogContent className="max-w-full w-full p-0 bg-white rounded-none shadow-2xl">
          {selectedTrader && (
            <div className="w-full h-full flex flex-col">
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between px-8 py-6 border-b bg-gray-50">
                <div className="flex items-center gap-4">
                  <button
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                    onClick={() => setSelectedTrader(null)}
                  >
                    <span style={{ fontSize: "1.5em" }}>&larr;</span>
                    <span>Go back</span>
                  </button>

                  <div className="relative">
                    {selectedTrader.avatarUrl ? (
                      <img
                        src={selectedTrader.avatarUrl}
                        alt="avatar"
                        className="w-16 h-16 rounded-full object-cover border-4 border-blue-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700 border-4 border-blue-100">
                        {(selectedTrader.name || selectedTrader.traderName)
                          ?.split(" ")[0][0]}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-900">
                      {(selectedTrader.name || selectedTrader.traderName)?.split(
                        " "
                      )[0]}
                    </span>
                    <span className="text-sm text-gray-500">
                      @{selectedTrader.traderName}
                    </span>
                  </div>

                  {selectedTrader.isTrader && (
                    <span className="ml-2 text-blue-500">
                      <Check size={22} />
                    </span>
                  )}
                </div>

                <button
                  className="text-gray-400 hover:text-gray-700 text-2xl"
                  onClick={() => setSelectedTrader(null)}
                >
                  &times;
                </button>
              </div>

              {/* COPY BUTTON */}
              <div className="px-8 py-4 border-b">
                <button
                  className="w-full px-8 py-4 rounded-xl text-lg font-bold bg-blue-600 text-white"
                  onClick={() => handleToggleCopy(selectedTrader.id)}
                >
                  {selectedTrader.copiedBy?.includes(clerkUser?.id || "")
                    ? "Cancel"
                    : "Copy"}
                </button>
              </div>

              {/* MODAL TABS */}
              <div className="px-8 pt-6 flex gap-6 border-b">
                <button
                  className={`pb-2 text-lg font-semibold ${
                    modalTab === "stats"
                      ? "border-b-2 border-blue-600 text-blue-700"
                      : "text-gray-500"
                  }`}
                  onClick={() => setModalTab("stats")}
                >
                  Stats
                </button>
                <button
                  className={`pb-2 text-lg font-semibold ${
                    modalTab === "trades"
                      ? "border-b-2 border-blue-600 text-blue-700"
                      : "text-gray-500"
                  }`}
                  onClick={() => setModalTab("trades")}
                >
                  Trades
                </button>
              </div>

              {/* TAB CONTENT */}
              <div className="flex-1 px-8 py-8 overflow-y-auto">
                {modalTab === "stats" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl">
                      <span style={{ fontSize: "1.5em" }}>📈</span>
                      <div>
                        <div className="text-sm text-gray-500">Win rate</div>
                        <div className="text-xl font-bold">
                          {selectedTrader.winRate ?? 0}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl">
                      <span style={{ fontSize: "1.5em" }}>💰</span>
                      <div>
                        <div className="text-sm text-gray-500">
                          Profit share
                        </div>
                        <div className="text-xl font-bold">
                          {selectedTrader.profitShare ?? "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === "trades" && (
                  <div className="text-gray-600">
                    No trade history available.
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}