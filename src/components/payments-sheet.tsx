"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import SheetButton from "./sheet-button"
import { Wallet2 } from "lucide-react"

export function PaymentsSheet() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="w-full">
          <SheetButton Icon={Wallet2} title="Payments" description="Deposit and Withdraw"></SheetButton>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Payments Settings</SheetTitle>
        </SheetHeader>
          <div className="py-4 space-y-4 text-sm">
            <Button 
              className="w-full justify-start" 
              onClick={() => {
                router.push("/dashboard/deposit")
                setOpen(false)
              }}
            >
              Deposit
              <span className="ml-2 text-sm text-muted-foreground">Deposit funds into your account</span>
            </Button>
            <Button 
              className="w-full justify-start" 
              onClick={() => {
                router.push("/dashboard/withdraw")
                setOpen(false)
              }}
            >
              Withdraw
              <span className="ml-2 text-sm text-muted-foreground">Withdrawals might take up to 24 hours to process</span>
            </Button>
          </div>

      </SheetContent>
    </Sheet>
  )
}

