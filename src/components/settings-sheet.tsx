"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PersonalSettingsSheet } from "./personal-settings-sheet"
import { SecuritySettingsSheet } from "./security-settings-sheet"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarMenuButton } from "./ui/sidebar"
import { Cog } from "lucide-react"
import { VerificationSheet } from "./verification-sheet"
import { useAuth } from "@/components/AuthProvider"

export function SettingsSheet() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const handleLogout = () => {
    // Implement logout logic here
    console.log("Logging out...")
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <SidebarMenuButton>
         <Cog/> Settings
        </SidebarMenuButton>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] pr-4">
          <div className="py-4 space-y-4 text-sm">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="/placeholder-avatar.png" alt="Sean Zay" />
                <AvatarFallback>SZ</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{user?.displayName}</h3>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <h4 className="font-semibold mt-6">Profile</h4>
            {/* <VerificationSheet/> */}

            <div className="space-y-2">
              <PersonalSettingsSheet />
            </div>

            <Button className="w-full" variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

