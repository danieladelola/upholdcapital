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
import { db } from "@/lib/firebase";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import type { JSX } from "react";
import { Asset, UserAsset } from "../../../../types";
import { fetchAssets } from "./utils";
import { Loader2 } from "lucide-react";

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
  const { user: clerkUser, isLoaded } = useUser();
  const user = clerkUser;
  const slug = pathname.split("/").pop() || "default";
  const uid = user?.id;

  const [userAssets, setUserAssets] = useState<UserAsset[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  // Ensure user exists in Firestore
  useEffect(() => {
    if (uid) {
      db.collection("users")
        .doc(uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const data = doc.data();
            if (!data?.name) {
              db.collection("users")
                .doc(uid)
                .set(
                  {
                    displayName:
                      user?.fullName || user?.firstName || "Unknown User",
                    email:
                      user?.emailAddresses[0]?.emailAddress || "Unknown Email",
                  },
                  { merge: true }
                );
            }
          } else {
            db.collection("users").doc(uid).set({
              displayName: user?.fullName || user?.firstName || "Unknown User",
              email: user?.emailAddresses[0]?.emailAddress || "Unknown Email",
            });
          }
        });
    }
  }, [uid, user]);

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

    if (isLoaded && uid) {
      fetchAndUpdateAssets();
    }
  }, [userAssets, isLoaded, uid]);

  // Listen for real-time updates
  useEffect(() => {
    if (uid) {
      const unsubscribeBalance = db
        .collection("users")
        .doc(uid)
        .onSnapshot((snapshot) => {
          const data = snapshot.data();
          if (data?.balance !== undefined) setBalance(data.balance);
        });

      const unsubscribeUserAssets = db
        .collection("users")
        .doc(uid)
        .collection("assets")
        .onSnapshot((snapshot) => {
          const updatedUserAssets = snapshot.docs.map((doc) => ({
            name: doc.id,
            amount: doc.data().amount,
            symbol: doc.id,
          }));
          setUserAssets(updatedUserAssets);
        });

      return () => {
        unsubscribeBalance();
        unsubscribeUserAssets();
      };
    }
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
      isLoaded ? (
        <JoinExpert />
      ) : (
        <LoadingSpinner />
      ),
    default: () => <div>Page not found</div>,
  };

  const Component = routeMap[slug] || routeMap.default;

  if (!isLoaded || isLoading) {
    return <LoadingSpinner />;
  }

  return <Component />;
}
