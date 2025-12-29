"use client";

import { usePathname } from "next/navigation";
import PortfolioDashboard from "@/components/dashboard";
import CopyTradingDashboard from "@/components/copy-trading"; // Updated import
import JoinExpert from "@/components/join-expert";
import { DepositsSection } from "@/components/deposits-section";
import { Subscriptions } from "@/components/subscriptions";
import { WithdrawalsSection } from "@/components/withdrawals-section";
import { StakingPage } from "@/components/staking-page";
import { AssetsPage } from "@/components/assets-page";
import { TradingPage } from "@/components/trading-page";
import MarketsPage from "@/components/market";
import PostTrade from "@/components/post-trade";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect } from "react";
import type { JSX } from "react";
import { Asset, UserAsset } from "../../../../types";
import { fetchAssets } from "./utils";
import { Loader2 } from "lucide-react";
import SettingsPage from "@/components/settings-page";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-gray-600 mx-auto" />
        <p className="mt-4 text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    </div>
  );
}

export default function Page() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const slug = pathname.split("/").pop() || "home";
  const uid = user?.id;

  const [userAssets, setUserAssets] = useState<UserAsset[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  // Ensure user exists in Firestore
  // useEffect(() => {
  //   if (uid && !loading) {
  //     db.collection("users")
  //       .doc(uid)
  //       .get()
  //       .then((doc) => {
  //         if (doc.exists) {
  //           const data = doc.data();
  //           if (!data?.name) {
  //             db.collection("users")
  //               .doc(uid)
  //               .set(
  //                 {
  //                   displayName:
  //                     user?.displayName || `${user?.firstname} ${user?.lastname}` || "Unknown User",
  //                   email:
  //                     user?.email || "Unknown Email",
  //                 },
  //                 { merge: true }
  //               );
  //           }
  //         } else {
  //           db.collection("users").doc(uid).set({
  //             displayName: user?.displayName || `${user?.firstname} ${user?.lastname}` || "Unknown User",
  //             email: user?.email || "Unknown Email",
  //           });
  //         }
  //       });
  //   }
  // }, [uid, user]);

  // Fetch assets and merge with user assets
  useEffect(() => {
    const fetchAndUpdateAssets = async () => {
      try {
        const fetchedAssets = await fetchAssets();
        if (fetchedAssets) {
          const updatedAssets = fetchedAssets.map((asset) => {
            const userAsset = userAssets.find(
              (ua) => ua.symbol === asset.symbol
            );
            if (userAsset) {
              return {
                ...asset,
                amount: (asset.amount || 0) + userAsset.amount,
              };
            }
            return asset;
          });
          setAssets(updatedAssets);
        }
      } catch (e) {
        console.error("Error fetching or updating assets:", e);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading && uid) {
      fetchAndUpdateAssets();
    }
  }, [userAssets, !loading, uid]);

  // Fetch balance from database
  useEffect(() => {
    const fetchBalance = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch('/api/user/balance');
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
  }, [user]);

  // Listen for real-time updates on user assets (from database)
  useEffect(() => {
    const fetchUserAssets = async () => {
      if (uid) {
        try {
          const response = await fetch(`/api/user/assets?userId=${uid}`);
          if (response.ok) {
            const userAssetsData = await response.json();
            setUserAssets(userAssetsData.map((ua: any) => ({
              name: ua.asset.name,
              symbol: ua.asset.symbol,
              amount: ua.balance,
            })));
          }
        } catch (error) {
          console.error('Error fetching user assets:', error);
        }
      }
    };

    fetchUserAssets();
  }, [uid]);

  const routeMap: { [key: string]: (props: any) => JSX.Element } = {
    "copy-trading": () =>
      user ? (
        <CopyTradingDashboard assets={assets} balance={balance} user={user} />
      ) : (
        <LoadingSpinner />
      ),
    subscriptions: () => <Subscriptions balance={balance} user={user as any} />,
    withdraw: () => <WithdrawalsSection user={user as any} balance={balance} />,
    deposit: () => <DepositsSection />,
    home: () =>
      user ? (
        <PortfolioDashboard assets={assets} balance={balance} user={user as any} />
      ) : (
        <LoadingSpinner />
      ),
    stake: () =>
      user ? (
        <StakingPage assets={assets} user={user as any} balance={balance} />
      ) : (
        <LoadingSpinner />
      ),
    assets: () => <AssetsPage assets={assets} />,
    trade: () =>
      user ? (
        <TradingPage assets={assets} balance={balance} user={user as any} />
      ) : (
        <LoadingSpinner />
      ),
    "post-trade": () =>
      user ? (
        <PostTrade />
      ) : (
        <LoadingSpinner />
      ),
    market: () => <MarketsPage assets={assets} />,
    "join-expert": () =>
      !loading ? (
        <JoinExpert />
      ) : (
        <LoadingSpinner />
      ),
    settings: () => <SettingsPage />,
    default: () => <div>Page not found</div>,
  };

  const Component = routeMap[slug] || routeMap.default;

  if (loading || isLoading) {
    return <LoadingSpinner />;
  }

  return <Component />;
}
