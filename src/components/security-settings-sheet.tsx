"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import SheetButton from "./sheet-button"
import { ShieldAlert } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"

export function SecuritySettingsSheet() {
  const [open, setOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const { user } = useUser()
  const {toast} = useToast()

  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    try {
      user?.updatePassword({
        currentPassword,
        newPassword,
      }).then(()=>{
        toast({title:"Password changed", description:"Your password has been changed succesfully"})
      })
      setOpen(false)
      setError("")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err:any) {
      setError(err.message || "An error occurred while updating the password")
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="w-full">
        <SheetButton title="Security" Icon={ShieldAlert} description="Email, password and 2FA"/>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Security Settings</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] pr-4">
          <div className="py-4 space-y-4 text-sm">
            {error && <div className="text-red-500">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password" 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
            </div>

            <Button onClick={handleSave}>Save</Button>

            {/* Add 2FA settings here */}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}