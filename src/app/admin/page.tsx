"use client";

import { useAuth } from "@/components/AuthProvider";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, CreditCard, Users, Settings, Receipt, TrendingUp, Wallet, ArrowDown, Coins, CandlestickChartIcon } from "lucide-react";
import DepositsManagement from "@/components/deposits-management";
import UsersManagement from "@/components/users-management";
import DepositMethodsManagement from "@/components/deposit-methods-management";
import SubscriptionsManagement from "@/components/subscriptions-management";
import StakingOptionsManagement from "@/components/staking-options-management";
import WalletConnections from "@/components/wallet-connections";
import WithdrawalsManagement from "@/components/withdrawals-management";
import AdminAssetsPage from "@/components/admin-assets-page";
import AdminTradesPage from "@/components/admin-trades-page";

const menuItems = [
  { id: 'assets', label: 'Asset Management', icon: Coins, component: AdminAssetsPage },
  { id: 'trades', label: 'Trade History', icon: CandlestickChartIcon, component: AdminTradesPage },
  { id: 'deposits', label: 'Deposits', icon: CreditCard, component: DepositsManagement },
  { id: 'withdrawals', label: 'Withdrawals', icon: ArrowDown, component: WithdrawalsManagement },
  { id: 'users', label: 'Users', icon: Users, component: UsersManagement },
  { id: 'deposit-methods', label: 'Deposit Methods', icon: Settings, component: DepositMethodsManagement },
  { id: 'subscriptions', label: 'Subscriptions', icon: Receipt, component: SubscriptionsManagement },
  { id: 'staking', label: 'Staking Options', icon: TrendingUp, component: StakingOptionsManagement },
  { id: 'connections', label: 'Wallet Connections', icon: Wallet, component: WalletConnections },
];

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('assets');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      redirect("/admin/login");
    }
  }, [user, loading]);

  const handleLogout = async () => {
    await logout();
    redirect("/admin/login");
  };

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'admin') return null;

  const ActiveComponent = menuItems.find(item => item.id === activeTab)?.component || DepositsManagement;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar className="border-r">
          <SidebarContent className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Admin Dashboard</h2>
            </div>
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-4 border-t">
              <Button onClick={handleLogout} variant="outline" className="w-full flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-4">
              <SidebarTrigger />
            </div>
            <ActiveComponent />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}