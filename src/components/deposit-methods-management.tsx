"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"

interface DepositMethod {
  id: string
  name: string
  enabled: boolean
  description: string | null
  cryptoType: string | null
  network: string | null
  networkName: string | null
  address: string | null
  createdAt: string
  updatedAt: string
}

export default function DepositMethodsManagement() {
  const [methods, setMethods] = useState<DepositMethod[]>([])
  const [newMethod, setNewMethod] = useState<Partial<DepositMethod>>({
    name: "",
    description: "",
    cryptoType: "",
    network: "",
    networkName: "",
    address: "",
    enabled: true,
  })
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<DepositMethod>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchMethods()
  }, [])

  const fetchMethods = async () => {
    try {
      const res = await fetch('/api/admin/deposit-methods')
      if (res.ok) {
        const data = await res.json()
        setMethods(data)
      }
    } catch (error) {
      console.error('Error fetching methods:', error)
      toast({ title: 'Error', description: 'Failed to fetch deposit methods' })
    }
  }

  const handleAddMethod = async () => {
    if (!newMethod.name?.trim()) {
      toast({ title: 'Error', description: 'Name is required' })
      return
    }

    try {
      const res = await fetch('/api/admin/deposit-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMethod),
      })
      if (res.ok) {
        setNewMethod({
          name: "",
          description: "",
          cryptoType: "",
          network: "",
          networkName: "",
          address: "",
          enabled: true,
        })
        fetchMethods()
        toast({ title: 'Success', description: 'Deposit method added' })
      } else {
        const error = await res.json()
        toast({ title: 'Error', description: error.error || 'Failed to add method' })
      }
    } catch (error) {
      console.error('Error adding method:', error)
      toast({ title: 'Error', description: 'Failed to add deposit method' })
    }
  }

  const handleEdit = (method: DepositMethod) => {
    setEditing(method.id)
    setEditData({ ...method })
  }

  const handleSave = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/deposit-methods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      if (res.ok) {
        fetchMethods()
        setEditing(null)
        toast({ title: 'Success', description: 'Deposit method updated' })
      } else {
        const error = await res.json()
        toast({ title: 'Error', description: error.error || 'Failed to update method' })
      }
    } catch (error) {
      console.error('Error updating method:', error)
      toast({ title: 'Error', description: 'Failed to update deposit method' })
    }
  }

  const handleCancel = () => {
    setEditing(null)
    setEditData({})
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deposit method?')) return

    try {
      const res = await fetch(`/api/admin/deposit-methods/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchMethods()
        toast({ title: 'Success', description: 'Deposit method deleted' })
      } else {
        const error = await res.json()
        toast({ title: 'Error', description: error.error || 'Failed to delete method' })
      }
    } catch (error) {
      console.error('Error deleting method:', error)
      toast({ title: 'Error', description: 'Failed to delete deposit method' })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Deposit Methods</CardTitle>
          <Sheet>
            <SheetTrigger asChild>
              <Button>Add Deposit Method</Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Add New Deposit Method</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Method Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Bitcoin Transfer"
                    value={newMethod.name || ''}
                    onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Optional description for users"
                    value={newMethod.description || ''}
                    onChange={(e) => setNewMethod({ ...newMethod, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="cryptoType">Cryptocurrency Type</Label>
                  <Input
                    id="cryptoType"
                    placeholder="e.g., BTC, ETH, USDT, SOL, TRX, USDC"
                    value={newMethod.cryptoType || ''}
                    onChange={(e) => setNewMethod({ ...newMethod, cryptoType: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="network">Network ID</Label>
                  <Input
                    id="network"
                    placeholder="e.g., BTC, ERC20, TRC20, SOL"
                    value={newMethod.network || ''}
                    onChange={(e) => setNewMethod({ ...newMethod, network: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="networkName">Network Name</Label>
                  <Input
                    id="networkName"
                    placeholder="e.g., Bitcoin, Ethereum, TRON, Solana"
                    value={newMethod.networkName || ''}
                    onChange={(e) => setNewMethod({ ...newMethod, networkName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Deposit Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter the deposit address for this method"
                    value={newMethod.address || ''}
                    onChange={(e) => setNewMethod({ ...newMethod, address: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="enabled">Enabled</Label>
                  <Switch
                    id="enabled"
                    checked={newMethod.enabled || false}
                    onCheckedChange={(checked) => setNewMethod({ ...newMethod, enabled: checked })}
                  />
                </div>
                <Button onClick={handleAddMethod} className="w-full">Add Method</Button>
              </div>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Crypto</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {methods.map((method) => (
                  <TableRow key={method.id}>
                    {editing === method.id ? (
                      <>
                        <TableCell>
                          <Input
                            value={editData.name || ''}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editData.cryptoType || ''}
                            onChange={(e) => setEditData({ ...editData, cryptoType: e.target.value })}
                            className="text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editData.network || ''}
                            onChange={(e) => setEditData({ ...editData, network: e.target.value })}
                            className="text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editData.address || ''}
                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                            className="text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={editData.enabled || false}
                            onCheckedChange={(checked) => setEditData({ ...editData, enabled: checked })}
                          />
                        </TableCell>
                        <TableCell>
                          <Button onClick={() => handleSave(method.id)} size="sm" className="mr-2">Save</Button>
                          <Button onClick={handleCancel} variant="outline" size="sm">Cancel</Button>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{method.name}</TableCell>
                        <TableCell>{method.cryptoType || '-'}</TableCell>
                        <TableCell>{method.network || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate text-xs">{method.address || '-'}</TableCell>
                        <TableCell>{method.enabled ? 'Yes' : 'No'}</TableCell>
                        <TableCell>
                          <Button onClick={() => handleEdit(method)} size="sm" className="mr-2">Edit</Button>
                          <Button onClick={() => handleDelete(method.id)} variant="destructive" size="sm">Delete</Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

