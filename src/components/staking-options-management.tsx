"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { addPool, updatePool, deletePool } from "../actions/staking-actions"
import { db } from "@/lib/firebase"

export type Pool = {
  id: string
  name: string
  symbol: string
  icon: string
  minimum: number
  maximum: number
  cycle: string
  roi:number
}

export default function StakingOptionsManagement() {
  const [pools, setPools] = useState<Pool[]>([])
  const [newPool, setNewPool] = useState<Omit<Pool, "id">>({
    name: "",
    symbol: "",
    icon: "",
    minimum: 0,
    maximum: 0,
    cycle: "",
    roi:0
  })

  useEffect(() => {
    const unsubscribe = db.collection("stakingPools").onSnapshot((snapshot) => {
      const newPools = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Pool[]
      setPools(newPools)
    })

    return () => unsubscribe()
  }, [])

  const handleAddPool = async () => {
    await addPool(newPool)
    setNewPool({
      name: "",
      symbol: "",
      icon: "",
      minimum: 0,
      maximum: 0,
      cycle: "",
      roi:0
    })
  }

  const handleUpdatePool = async (id: string, updatedData: Partial<Pool>) => {
    await updatePool(id, updatedData)
  }

  const handleDeletePool = async (id: string) => {
    await deletePool(id)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Staking Options</h2>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Input placeholder="Name" value={newPool.name} onChange={(e) => setNewPool({...newPool, name: e.target.value})} />
        <Input placeholder="Symbol" value={newPool.symbol} onChange={(e) => setNewPool({...newPool, symbol: e.target.value})} />
        <Input placeholder="Just use token symbol EG USDT" value={newPool.icon} onChange={(e) => setNewPool({...newPool, icon: e.target.value})} />
        <Input type="number" placeholder="Minimum" value={newPool.minimum} onChange={(e) => setNewPool({...newPool, minimum: parseFloat(e.target.value)})} />
        <Input type="number" placeholder="Maximum" value={newPool.maximum} onChange={(e) => setNewPool({...newPool, maximum: parseFloat(e.target.value)})} />
        <Input placeholder="Cycle" value={newPool.cycle} onChange={(e) => setNewPool({...newPool, cycle: e.target.value})} />
        <Input type="number" placeholder="ROI" value={newPool.roi} onChange={(e) => setNewPool({...newPool, roi: parseFloat(e.target.value)})} />
      </div>
      <Button onClick={handleAddPool} className="mb-4">Add Staking Option</Button>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Minimum</TableHead>
            <TableHead>Maximum</TableHead>
            <TableHead>Cycle</TableHead>
            <TableHead>ROI</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pools.map((pool) => (
            <TableRow key={pool.id}>
              <TableCell>{pool.name}</TableCell>
              <TableCell>{pool.symbol}</TableCell>
              <TableCell>{pool.minimum}</TableCell>
              <TableCell>{pool.maximum}</TableCell>
              <TableCell>{pool.cycle}</TableCell>
              <TableCell>{pool.roi}</TableCell>
              <TableCell>
                
                <Button onClick={() => handleUpdatePool(pool.id, { /* updated fields */ })} className="mr-2">Edit</Button>
                <Button onClick={() => handleDeletePool(pool.id)} variant="destructive">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

