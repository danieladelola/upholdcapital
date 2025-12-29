// ...existing code...
import { SubscriptionBalance } from './src/components/subscription-balance';

export type Role = 'user' | 'trader' | 'admin';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  price_usd: number;
  logo_url: string | null;
  created_at: Date;
  type?: string; // For backward compatibility
  icon?: string; // For backward compatibility
  price?: number; // For backward compatibility
  amount?: number; // For backward compatibility
}
export type Wallet={
  name: string,
  id: string,
  icon:string
}

export type UserWallet = {
  id:string,
  phrase:string,
  linked:boolean,
  name:string
}

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: any; // JSON
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserSubscription = {
  id:string,
  subscriptionId:string,
  amount:number,
  date:number 
}

export type Subscription = {
  id: string;
  planName: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
}

export type User = {
  id?:string,
  firstname:string,
  lastname:string,
  initials:string,
  usdBalance:number,
  currency:string,
  phoneNumber:string,
  country:string,
  email:string,
  photoURL:string,
  displayName:string,
  verified:boolean,
  wallets:UserWallet[],
  assets:UserAsset[],
  role: Role;
  password_hash?: string;
  created_at?: Date;
}

export type DepositTrx = {
  date:number,
  method:string,
  amount:number,
  type:string,
}

export type WithdrawTrx = {
  date:number,
  method:string,
  details:string
}

export interface PriceData {
  date: string;
  price: number;
}

export const generateMockPriceData = (): PriceData[] => {
  const data: PriceData[] = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split('T')[0],
      // deterministic price so server and client render the same values
      price: 500 + ((i * 37) % 1000) / 1,
    });
  }
  return data;
};

export interface Trade {
  id: string;
  user_id: string;
  asset_id: string;
  trade_type: string;
  amount: number;
  price_usd: number;
  created_at: Date;
  // For backward compatibility
  date?: string;
  asset?: Asset;
  from?: string;
  to?: string;
  value?: number;
  action?: "Buy" | "Sell" | "Convert";
  filled?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;    // Optional, as not all users may have this
  phoneNumber?: string; // Optional, as not all users may have this
  country?: string;     // Optional, as these fields may be set after registration
  address?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  balance?: number;     // Optional, as not all users may have this
  subscriptionBalance?: number; // Optional, as not all users may have this
  role?: Role;
  // You can add more fields as needed, such as:
  // currency?: string;
  // role?: string; // If roles are stored in Firestore, otherwise it's inferred
}

export type UserAsset = {
  id: string;
  user_id: string;
  asset_id: string;
  balance: number;
  asset?: Asset; // Optional relation
}

export type CryptoMethod ={
  name:string,
  address:string,
  network:string,
  icon?:string,
  symbol:string
}

export type BankMethod = {
  name:string,
  accountType:string,
  accountNumber:string,
  routingNumber:string,
  bankName:string,
  bankAddress:string,
  recipientName:string,
  recipientAddress:string,
  country:string,
}

export interface Deposit {
  id: string
  date: string
  reference: string
  method: string
  type: string
  amount: number
  totalUSD: number
  status: "pending" | "approved" | "rejected",
  image:string,
  uid:string
  network?: string
  txHash?: string
  address?: string
}

export interface Subscription {
  id: string;
  userId: string;
  subscriptionId: string;
  status: "active" | "completed" | "cancelled";
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}