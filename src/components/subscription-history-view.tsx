import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { Subscription } from "../../types"


export function SubscriptionHistoryView({subHistory}:{subHistory:Subscription[]}) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(subHistory)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>{sub.planName}</TableCell>
                <TableCell>${sub.amount.toLocaleString('en-US')}</TableCell>
                <TableCell>{sub.startDate}</TableCell>
                <TableCell>{sub.endDate}</TableCell>
                <TableCell>
                  <span className={`capitalize ${sub.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                    {sub.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

