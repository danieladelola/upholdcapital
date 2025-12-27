"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"

interface DepositMethod {
  id: string
  name: string
  enabled: boolean
  description: string | null
  createdAt: string
  updatedAt: string
}

export default function DepositMethodsManagement() {
  const [methods, setMethods] = useState<DepositMethod[]>([])
  const [newMethod, setNewMethod] = useState({ name: "", description: "" })

  useEffect(() => {
    fetchMethods()
  }, [])

  const fetchMethods = async () => {
    try {
      const res = await fetch('/api/admin/deposit-methods');
      if (res.ok) {
        const data = await res.json();
        setMethods(data);
      }
    } catch (error) {
      console.error('Error fetching methods:', error);
    }
  }

  const handleAddMethod = async () => {
    if (!newMethod.name.trim()) return;

    try {
      const res = await fetch('/api/admin/deposit-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMethod),
      });
      if (res.ok) {
        setNewMethod({ name: "", description: "" });
        fetchMethods();
      }
    } catch (error) {
      console.error('Error adding method:', error);
    }
  }

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    // TODO: implement toggle API
    console.log('Toggle method', id, enabled);
  }

  const handleDelete = async (id: string) => {
    // TODO: implement delete API
    console.log('Delete method', id);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Deposit Methods</h2>
      
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Add New Method</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newMethod.name}
              onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
              placeholder="e.g., Bank Transfer"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newMethod.description}
              onChange={(e) => setNewMethod({ ...newMethod, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>
        </div>
        <Button onClick={handleAddMethod} className="mt-4">Add Method</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Enabled</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {methods.map((method) => (
            <TableRow key={method.id}>
              <TableCell>{method.name}</TableCell>
              <TableCell>{method.description || '-'}</TableCell>
              <TableCell>
                <Switch
                  checked={method.enabled}
                  onCheckedChange={(checked) => handleToggleEnabled(method.id, checked)}
                />
              </TableCell>
              <TableCell>{new Date(method.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button onClick={() => handleDelete(method.id)} variant="destructive" size="sm">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

