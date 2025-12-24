import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DepositsManagement from "@/components/deposits-management";
import UsersManagement from "@/components/users-management";
import DepositMethodsManagement from "@/components/deposit-methods-management";
import SubscriptionsManagement from "@/components/subscriptions-management";
import StakingOptionsManagement from "@/components/staking-options-management";
import WalletConnections from "@/components/wallet-connections";

export const dynamic = 'force-dynamic';

// List of admin emails (can also be stored in environment variables)
const ADMIN_EMAILS = ["itemilayo.r@gmail.com", "mailbettywood@gmail.com", "temilayox@gmail.com"];

export default async function AdminDashboard() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userEmail = user.emailAddresses[0]?.emailAddress;

  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Tabs defaultValue="deposits" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="deposit-methods">Deposit Methods</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="staking">Staking Options</TabsTrigger>
          <TabsTrigger value="connections">Wallet Connections</TabsTrigger>
        </TabsList>
        <TabsContent value="deposits">
          <DepositsManagement />
        </TabsContent>
        <TabsContent value="users">
          <UsersManagement />
        </TabsContent>
        <TabsContent value="deposit-methods">
          <DepositMethodsManagement />
        </TabsContent>
        <TabsContent value="subscriptions">
          <SubscriptionsManagement />
        </TabsContent>
        <TabsContent value="staking">
          <StakingOptionsManagement />
        </TabsContent>
        <TabsContent value="connections">
          <WalletConnections />
        </TabsContent>
      </Tabs>
    </div>
  );
}