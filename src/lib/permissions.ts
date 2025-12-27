import { Role } from "types";

export const ROLES = {
  USER: "user" as Role,
  TRADER: "trader" as Role,
  ADMIN: "admin" as Role,
};

export const PERMISSIONS = {
  DASHBOARD: "dashboard",
  DEPOSITS: "deposits",
  SUBSCRIPTIONS: "subscriptions",
  STAKING: "staking",
  WALLET_CONNECTIONS: "wallet_connections",
  COPY_TRADING: "copy_trading",
  ADMIN_DASHBOARD: "admin_dashboard",
  POST_TRADE: "post_trade",
  ASSET_MANAGEMENT: "asset_management",
  TRADE_HISTORY: "trade_history",
};

export const rolePermissions: Record<Role, string[]> = {
  [ROLES.USER]: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.DEPOSITS,
    PERMISSIONS.SUBSCRIPTIONS,
    PERMISSIONS.STAKING,
    PERMISSIONS.WALLET_CONNECTIONS,
  ],
  [ROLES.TRADER]: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.DEPOSITS,
    PERMISSIONS.SUBSCRIPTIONS,
    PERMISSIONS.STAKING,
    PERMISSIONS.WALLET_CONNECTIONS,
    PERMISSIONS.COPY_TRADING,
    PERMISSIONS.POST_TRADE,
  ],
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
} as Record<Role, string[]>;
