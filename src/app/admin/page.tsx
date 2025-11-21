"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react"; // Import useEffect
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DepositsManagement from "@/components/deposits-management";
import UsersManagement from "@/components/users-management";
import DepositMethodsManagement from "@/components/deposit-methods-management";
import SubscriptionsManagement from "@/components/subscriptions-management";
import StakingOptionsManagement from "@/components/staking-options-management";
import WalletConnections from "@/components/wallet-connections";

// List of admin emails (can also be stored in environment variables)
const ADMIN_EMAILS = ["itemilayo.r@gmail.com", "mailbettywood@gmail.com", "temilayox@gmail.com"];

function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Check if the user is an admin
  const isAdmin = () => {
    if (!isLoaded || !user) return false;

    // Get the user's email
    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (userEmail) {
      const isAdminUser = ADMIN_EMAILS.includes(userEmail);
      return isAdminUser;
    } else {
      return false;
    }
  };

  // Use useEffect to handle redirection after the user data is loaded
  useEffect(() => {
    if (isLoaded && !isAdmin()) {
      router.push("/dashboard"); // Redirect to the dashboard if the user is not an admin
    }
  }, [isLoaded, user]); // Run this effect when isLoaded or user changes

  // If the user is not an admin, return null (the useEffect will handle the redirection)
  if (!isLoaded || !isAdmin()) {
    return null; // Render nothing while checking or redirecting
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

// Apply the Clerk authentication guard
export default AdminDashboard;