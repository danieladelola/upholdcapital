"use client"

import { useAuth } from "@/components/AuthProvider"

interface Plan {
  name: string
  minimum: number
  maximum: number
  duration: number
  roi: number
}

interface PurchaseFormProps {
  plans: Plan[]
}

export function PurchaseForm({ plans }: PurchaseFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [amount, setAmount] = useState("")
  const [balance, setBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(true)

  const { user } = useAuth()
    if (!user?.id) {
      setBalance(0)
      setBalanceLoading(false)
      return
    }

    const { db } = require("@/lib/firebase")
    const unsubscribe = db
      .collection("users")
      .doc(user.id)
      .onSnapshot((doc: any) => {
        const data = doc.data()
        setBalance((data?.balance ?? 0) as number)
        setBalanceLoading(false)
      }, (err: any) => {
        console.error("Failed to subscribe to user balance", err)
        setBalance(0)
        setBalanceLoading(false)
      })

    return () => unsubscribe()
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedPlan) {
      console.log("Subscription purchased:", { plan: selectedPlan.name, amount })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="plan" className="block text-sm font-medium text-muted-foreground mb-1">
          Select Plan
        </label>
        <Select onValueChange={(value) => setSelectedPlan(plans.find(p => p.name === value) || null)}>
          <SelectTrigger id="plan">
            <SelectValue placeholder="Choose a plan" />
          </SelectTrigger>
          <SelectContent>
            {plans.map((plan) => (
              <SelectItem key={plan.name} value={plan.name}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedPlan && (
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-muted-foreground mb-1">
            Amount
          </label>
          <div className="flex items-center">
            <Input
              id="amount"
              type="number"
              min={selectedPlan.minimum}
              max={selectedPlan.maximum}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full"
            />
            <span className="ml-2">USD</span>
          </div>
        </div>
      )}
      <div>
        <p className="text-sm text-muted-foreground">Current balance</p>
        <p className="font-medium">{balanceLoading ? "Loading..." : `$${Number(balance || 0).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`}</p>
      </div>
      <Button type="submit" className="w-full" disabled={!selectedPlan || !amount}>
        Purchase Subscription
      </Button>
    </form>
  )
}

