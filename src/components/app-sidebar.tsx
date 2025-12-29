"use client"

import { useEffect, useState } from "react"
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
import { useAuth } from "@/components/AuthProvider"
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
      name: "Home",
      url: "/dashboard/home",
      icon: Frame,
      permission: null, // Show to all users
    },
    {
      name: "Deposit",
      url: "/dashboard/deposit",
      icon: Landmark,
      permission: null, // Show to all users
    },
    {
      name: "Withdraw",
      url: "/dashboard/withdraw",
      icon: HandCoins,
      permission: null, // Show to all users
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
      permission: null, // Show to all users
    },
    {
      name: "Market",
      url: "/dashboard/market",
      icon: PieChart,
      permission: null, // Show to all users
    },
    {
      name: "Trade",
      url: "/dashboard/trade",
      icon: CandlestickChartIcon,
      permission: null, // Show to all users
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
      permission: null, // Show to all users
    },
    {
      name: "Stake",
      url: "/dashboard/stake",
      icon: Vault,
      permission: null, // Show to all users
    },
    {
      name: "Connect Wallet",
      url: "/dashboard/connect-wallet",
      icon: PlugZap2,
      permission: null, // Show to all users
    },
    {
      name: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
      permission: null, // Show to all users
    },
    {
      name: "Admin Dashboard",
      url: "/admin",
      icon: Settings2,
      permission: PERMISSIONS.ADMIN_DASHBOARD,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const [accessibleLinks, setAccessibleLinks] = useState<typeof data.links>(() => {
    // Show default (regular user) links immediately to avoid waiting on async permission checks
    const defaultPerms = rolePermissions[ROLES.USER] || [];
    // Always include Copy Trading link for all users
    return data.links.filter((l) => l.permission === null || defaultPerms.includes(l.permission));
  })

  useEffect(() => {
    if (!user) return;
    // Start a quick POST_TRADE check in parallel so traders see the Post Trade link immediately
    const hasPost = user.role === 'trader' || user.role === 'admin';
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

    const filteredLinks = data.links.filter((link) => {
      return link.permission === null || (rolePermissions[user.role] && rolePermissions[user.role].includes(link.permission));
    });

    // If user has POST_TRADE permission (i.e., is a trader), place Post Trade after Withdraw
    const hasPostTrade = user.role === 'trader' || user.role === 'admin';
    if (hasPostTrade) {
      const postIndex = filteredLinks.findIndex((l: any) => l.permission === PERMISSIONS.POST_TRADE);
      const withdrawIndex = filteredLinks.findIndex((l: any) => l.permission === PERMISSIONS.DEPOSITS);
      if (postIndex > -1 && withdrawIndex > -1) {
        const [postLink] = filteredLinks.splice(postIndex, 1);
        const insertIndex = Math.min(withdrawIndex + 1, filteredLinks.length);
        filteredLinks.splice(insertIndex, 0, postLink);
      }
    }

    setAccessibleLinks(filteredLinks);
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
