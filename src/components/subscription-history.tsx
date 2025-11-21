import { Button } from "@/components/ui/button"

interface SubscriptionHistoryProps {
  onViewHistory: () => void
}

export function SubscriptionHistory({ onViewHistory }: SubscriptionHistoryProps) {
  return (
    <div>
      <p className="text-muted-foreground mb-2">View your subscription history</p>
      <Button variant="outline" onClick={onViewHistory}>View history</Button>
    </div>
  )
}

