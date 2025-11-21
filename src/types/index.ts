export type Asset = {
  id: string;
  name: string;
  symbol: string;
  iconUrl?: string;
  balance?: number;
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
  name: string;
  createdAt: Date;
};

export type Trader = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  tradingExperience: number;
  accountBalance: number;
  riskLevel: string;
};
