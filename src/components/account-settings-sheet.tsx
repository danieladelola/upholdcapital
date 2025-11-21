"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import SheetButton from "./sheet-button"

export function AccountSettingsSheet() {
  const [open, setOpen] = useState(false)
  const [currency, setCurrency] = useState("usd")

  const handleSave = () => {
    // Implement save logic here
    console.log("Saving account settings...")
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="w-full">
        <SheetButton title="Account" description="Currency settings"/>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Account Settings</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] pr-4">
          <div className="py-4 space-y-4 text-sm">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                  <SelectItem value="gbp">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSave}>Save</Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

