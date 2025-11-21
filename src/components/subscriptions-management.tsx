"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { addSubscription, updateSubscription, deleteSubscription } from "../actions/subscription-actions"
import { db } from "@/lib/firebase"

export type Subscription = {
  id: string
  name: string
  sector: string
  img: string
  minimum: number
  maximum: number
  duration: number
  roi: number
}

export default function SubscriptionsManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [newSubscription, setNewSubscription] = useState<Omit<Subscription, "id">>({
    name: "",
    sector: "",
    img: "",
    minimum: 0,
    maximum: 0,
    duration: 0,
    roi: 0
  })

  useEffect(() => {
    const unsubscribe = db.collection("subscriptions").onSnapshot((snapshot) => {
      const newSubscriptions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Subscription[]
      setSubscriptions(newSubscriptions)
    })

    return () => unsubscribe()
  }, [])

  const handleAddSubscription = async () => {
    await addSubscription(newSubscription)
    setNewSubscription({
      name: "",
      sector: "",
      img: "",
      minimum: 0,
      maximum: 0,
      duration: 0,
      roi: 0
    })
  }

  const handleUpdateSubscription = async (id: string, updatedData: Partial<Subscription>) => {
    await updateSubscription(id, updatedData)
  }

  const handleDeleteSubscription = async (id: string) => {
    await deleteSubscription(id)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Subscriptions</h2>
      
      <div className="grid grid-cols-4 gap-2 mb-4">
        <Input placeholder="Name" value={newSubscription.name} onChange={(e) => setNewSubscription({...newSubscription, name: e.target.value})} />
        <Input placeholder="Sector" value={newSubscription.sector} onChange={(e) => setNewSubscription({...newSubscription, sector: e.target.value})} />
        <Input placeholder="Image URL" value={newSubscription.img} onChange={(e) => setNewSubscription({...newSubscription, img: e.target.value})} />
        <Input type="number" placeholder="Minimum" value={newSubscription.minimum} onChange={(e) => setNewSubscription({...newSubscription, minimum: parseFloat(e.target.value)})} />
        <Input type="number" placeholder="Maximum" value={newSubscription.maximum} onChange={(e) => setNewSubscription({...newSubscription, maximum: parseFloat(e.target.value)})} />
        <Input type="number" placeholder="Duration (days)" value={newSubscription.duration} onChange={(e) => setNewSubscription({...newSubscription, duration: parseInt(e.target.value)})} />
        <Input type="number" placeholder="ROI (%)" value={newSubscription.roi} onChange={(e) => setNewSubscription({...newSubscription, roi: parseFloat(e.target.value)})} />
      </div>
      <Button onClick={handleAddSubscription} className="mb-4">Add Subscription</Button>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Minimum</TableHead>
            <TableHead>Maximum</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>ROI</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell>{subscription.name}</TableCell>
              <TableCell>{subscription.sector}</TableCell>
              <TableCell>{subscription.minimum}</TableCell>
              <TableCell>{subscription.maximum}</TableCell>
              <TableCell>{subscription.duration}</TableCell>
              <TableCell>{subscription.roi}%</TableCell>
              <TableCell>
                <Button onClick={() => handleUpdateSubscription(subscription.id, { /* updated fields */ })} className="mr-2">Edit</Button>
                <Button onClick={() => handleDeleteSubscription(subscription.id)} variant="destructive">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

