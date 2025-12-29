"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: any;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Subscription = SubscriptionPlan;

export default function SubscriptionsManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: 0,
    duration: "monthly",
    features: [] as string[],
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    const res = await fetch('/api/admin/subscriptions')
    const data = await res.json()
    setPlans(data)
  }

  const handleAdd = async () => {
    await fetch('/api/admin/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlan),
    })
    setNewPlan({ name: "", price: 0, duration: "monthly", features: [] })
    fetchPlans()
  }

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditing(plan.id)
  }

  const handleSave = async (id: string, updated: Partial<SubscriptionPlan>) => {
    await fetch(`/api/admin/subscriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    setEditing(null)
    fetchPlans()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/subscriptions/${id}`, {
      method: 'DELETE',
    })
    fetchPlans()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Subscription Plans</h2>
      
      <div className="grid grid-cols-4 gap-2 mb-4">
        <Input placeholder="Name" value={newPlan.name} onChange={(e) => setNewPlan({...newPlan, name: e.target.value})} />
        <Input type="number" placeholder="Price" value={newPlan.price} onChange={(e) => setNewPlan({...newPlan, price: parseFloat(e.target.value)})} />
        <Input placeholder="Duration" value={newPlan.duration} onChange={(e) => setNewPlan({...newPlan, duration: e.target.value})} />
        <Textarea placeholder="Features (one per line)" value={newPlan.features.join('\n')} onChange={(e) => setNewPlan({...newPlan, features: e.target.value.split('\n')})} />
      </div>
      <Button onClick={handleAdd} className="mb-4">Add Plan</Button>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Features</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id}>
              <TableCell>
                {editing === plan.id ? (
                  <Input value={plan.name} onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? {...p, name: e.target.value} : p))} />
                ) : plan.name}
              </TableCell>
              <TableCell>
                {editing === plan.id ? (
                  <Input type="number" value={plan.price} onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? {...p, price: parseFloat(e.target.value)} : p))} />
                ) : `$${plan.price}`}
              </TableCell>
              <TableCell>
                {editing === plan.id ? (
                  <Input value={plan.duration} onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? {...p, duration: e.target.value} : p))} />
                ) : plan.duration}
              </TableCell>
              <TableCell>
                {editing === plan.id ? (
                  <Textarea value={Array.isArray(plan.features) ? plan.features.join('\n') : ''} onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? {...p, features: e.target.value.split('\n')} : p))} />
                ) : Array.isArray(plan.features) ? plan.features.join(', ') : ''}
              </TableCell>
              <TableCell>
                {editing === plan.id ? (
                  <>
                    <Button onClick={() => handleSave(plan.id, plan)}>Save</Button>
                    <Button onClick={() => setEditing(null)}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => handleEdit(plan)}>Edit</Button>
                    <Button onClick={() => handleDelete(plan.id)}>Delete</Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

