export function PlanDetails() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Plans</h2>
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-2">Starter plan</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Minimum</p>
            <p className="font-medium">$11,000.00</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Maximum</p>
            <p className="font-medium">$19,500.00</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Plan duration</p>
            <p className="font-medium">3 days</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ROI</p>
            <p className="font-medium">200%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

