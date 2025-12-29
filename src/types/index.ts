export type Asset = {
  id: string;
  symbol: string;
  name: string;
  price_usd: number;
  logo_url?: string;
  created_at: Date;
};

export type FetchedAsset = {
  name: string;
  price: number;
  symbol: string;
  icon: string;
  type: string;
  amount: number;
};

export type UserResource = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  // Add more fields as needed for user context
};

export type User = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  initials: string;
  usdBalance: number;
  currency: string;
  phoneNumber: string;
  country: string;
  photoURL: string;
  displayName: string;
  verified: boolean;
  wallets: any;
  assets: any;
  role: any;
  password_hash: string;
  created_at: Date;
};

export type UserAsset = {
  id?: string;
  symbol: string;
  amount: number;
  name?: string;
};

export type Trade = {
  id: string;
  date: string;
  asset: {
    name: string;
    symbol: string;
    type: string;
    icon: string;
    price: number;
    amount: number;
  };
  from?: string;
  to?: string;
  amount: number;
  value: number;
  action: string;
  filled: boolean;
};
