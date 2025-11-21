"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Wallet,
  Map,
  PieChart,
  Settings2,
  PlugZap2,
  Vault,
  Coins,
  CandlestickChartIcon,
  HandCoins,
  Banknote,
  Landmark, type LucideIcon
} from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { hasPermission } from "@/lib/auth"
import { PERMISSIONS, ROLES, rolePermissions } from "@/lib/permissions"

import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,

} from "@/components/ui/sidebar"
// This is sample data.
const data = {
  user: {
    name: "Current User",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  links: [
    {
      name: "Deposit",
      url: "/dashboard/deposit",
      icon: Landmark,
      permission: PERMISSIONS.DEPOSITS,
    },
    {
      name: "Withdraw",
      url: "/dashboard/withdraw",
      icon: HandCoins,
      permission: PERMISSIONS.DEPOSITS,
    },
    {
      name: "Copy Trading",
      url: "/dashboard/copy-trading",
      icon: Bot,
      permission: null, // Show to all roles
    },
    
    {
      name: "Assets",
      url: "/dashboard/assets",
      icon: Wallet,
      permission: PERMISSIONS.WALLET_CONNECTIONS,
    },
    {
      name: "Market",
      url: "/dashboard/market",
      icon: PieChart,
      permission: PERMISSIONS.DASHBOARD,
    },
    {
      name: "Trade",
      url: "/dashboard/trade",
      icon: CandlestickChartIcon,
      permission: PERMISSIONS.DASHBOARD,
    },
    {
      name: "Post Trade",
      url: "/dashboard/post-trade",
      icon: CandlestickChartIcon,
      permission: PERMISSIONS.POST_TRADE,
    },
    {
      name: "Subscriptions",
      url: "/dashboard/subscriptions",
      icon: Coins,
      permission: PERMISSIONS.SUBSCRIPTIONS,
    },
    {
      name: "Stake",
      url: "/dashboard/stake",
      icon: Vault,
      permission: PERMISSIONS.STAKING,
    },
    // {
    //   name: "Connect Wallet",
    //   url: "/dashboard/connect-wallet",
    //   icon: PlugZap2,
    //   permission: PERMISSIONS.WALLET_CONNECTIONS,
    // },
    // {
    //   name: "Settings",
    //   url: "/dashboard/settings",
    //   icon: Settings2,
    //   permission: PERMISSIONS.DASHBOARD,
    // },
    // {
    //   name: "Admin Dashboard",
    //   url: "/dashboard/admin",
    //   icon: Settings2,
    //   permission: PERMISSIONS.ADMIN_DASHBOARD,
    // }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const [accessibleLinks, setAccessibleLinks] = React.useState<typeof data.links>(() => {
    // Show default (regular user) links immediately to avoid waiting on async permission checks
    const defaultPerms = rolePermissions[ROLES.USER] || [];
    // Always include Copy Trading link for all users
    return data.links.filter((l) => l.permission === null || defaultPerms.includes(l.permission));
  })

  React.useEffect(() => {
    if (user) {
      // Start a quick POST_TRADE check in parallel so traders see the Post Trade link immediately
      const postCheck = hasPermission(user.id, PERMISSIONS.POST_TRADE).then((hasPost) => {
        if (hasPost) {
          setAccessibleLinks((prev) => {
            if (prev.some((l) => l.permission === PERMISSIONS.POST_TRADE)) return prev;
            const withdrawIndex = prev.findIndex((l) => l.permission === PERMISSIONS.DEPOSITS);
            const postLink = data.links.find((l) => l.permission === PERMISSIONS.POST_TRADE);
            if (!postLink) return prev;
            const next = [...prev];
            const insertIndex = withdrawIndex > -1 ? withdrawIndex + 1 : next.length;
            next.splice(insertIndex, 0, postLink);
            return next;
          });
        }
      }).catch(() => {});

      const checkPermissions = async () => {
        const filteredLinks: typeof data.links = [];
        for (const link of data.links) {
          try {
            if (link.permission === null || await hasPermission(user.id, link.permission)) {
              filteredLinks.push(link);
            }
          } catch (e) {
            // ignore permission check errors and continue
          }
        }

        // If user has POST_TRADE permission (i.e., is a trader), place Post Trade after Withdraw
        try {
          const hasPostTrade = await hasPermission(user.id, PERMISSIONS.POST_TRADE);
          if (hasPostTrade) {
            const postIndex = filteredLinks.findIndex((l: any) => l.permission === PERMISSIONS.POST_TRADE);
            const withdrawIndex = filteredLinks.findIndex((l: any) => l.permission === PERMISSIONS.DEPOSITS);
            if (postIndex > -1 && withdrawIndex > -1) {
              const [postLink] = filteredLinks.splice(postIndex, 1);
              const insertIndex = Math.min(withdrawIndex + 1, filteredLinks.length);
              filteredLinks.splice(insertIndex, 0, postLink);
            }
          }
        } catch (e) {
          // ignore
        }

        try { await postCheck } catch (e) {}
        setAccessibleLinks(filteredLinks);
      };
      checkPermissions();
    }
  }, [user])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
      <SidebarMenu>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
          </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects
          projects={accessibleLinks as {
            name: string
            url: string
            icon: LucideIcon
          }[]}
        />

      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar >
  )
}
