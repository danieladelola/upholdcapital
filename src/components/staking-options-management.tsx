"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Asset = {
  id: string
  symbol: string
  name: string
}

export type AssetStaking = {
  id: string
  symbol: string
  name: string
  logoUrl?: string
  stakingEnabled: boolean
  stakeMin?: number
  stakeMax?: number
  stakeRoi?: number
  stakeCycleDays?: number
}

export type Pool = AssetStaking;

export default function StakingOptionsManagement() {
  const [assets, setAssets] = useState<AssetStaking[]>([])
  const [allAssets, setAllAssets] = useState<Asset[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<AssetStaking>>({})
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newStakingData, setNewStakingData] = useState<Partial<AssetStaking>>({
    stakingEnabled: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchAssets()
    fetchAllAssets()
  }, [])

  const fetchAssets = async () => {
    const res = await fetch('/api/admin/staking-options')
    if (res.ok) {
      const data = await res.json()
      setAssets(data)
    }
  }

  const fetchAllAssets = async () => {
    const res = await fetch('/api/admin/assets')
    if (res.ok) {
      const data = await res.json()
      setAllAssets(data)
    }
  }

  const handleAssetSelect = (assetId: string) => {
    const selected = allAssets.find(a => a.id === assetId)
    if (selected) {
      setNewStakingData({
        ...newStakingData,
        id: selected.id,
        symbol: selected.symbol,
        name: selected.name,
      })
    }
  }

  const handleEdit = (asset: AssetStaking) => {
    setEditing(asset.id)
    setEditData({
      stakingEnabled: asset.stakingEnabled,
      stakeMin: asset.stakeMin,
      stakeMax: asset.stakeMax,
      stakeRoi: asset.stakeRoi,
      stakeCycleDays: asset.stakeCycleDays,
    })
  }

  const handleSave = async (assetId: string) => {
    const res = await fetch(`/api/admin/staking-options/${assetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    })
    if (res.ok) {
      await fetchAssets()
      setEditing(null)
    }
  }

  const handleCancel = () => {
    setEditing(null)
    setEditData({})
  }

  const handleAddNew = async () => {
    if (!newStakingData.symbol || !newStakingData.name) {
      toast({ title: 'Error', description: 'Asset selection is required' })
      return
    }

    try {
      const res = await fetch('/api/admin/staking-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStakingData),
      })
      if (res.ok) {
        await fetchAssets()
        setIsAddingNew(false)
        setNewStakingData({ stakingEnabled: true })
        toast({ title: 'Success', description: 'Staking option added' })
      } else {
        const error = await res.json()
        toast({ title: 'Error', description: error.error || 'Failed to add staking option' })
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add staking option' })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Staking Options</CardTitle>
        <Sheet open={isAddingNew} onOpenChange={setIsAddingNew}>
          <SheetTrigger asChild>
            <Button>Add Staking</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Staking Option</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="asset">Select Asset</Label>
                <Select value={newStakingData.id || ''} onValueChange={handleAssetSelect}>
                  <SelectTrigger id="asset">
                    <SelectValue placeholder="Select an asset..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allAssets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.symbol} - {asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newStakingData.symbol && newStakingData.name && (
                <div className="p-3 bg-muted rounded">
                  <p className="text-sm"><strong>Symbol:</strong> {newStakingData.symbol}</p>
                  <p className="text-sm"><strong>Name:</strong> {newStakingData.name}</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Label htmlFor="enabled">Enabled</Label>
                <Switch
                  id="enabled"
                  checked={newStakingData.stakingEnabled || false}
                  onCheckedChange={(checked) => setNewStakingData({ ...newStakingData, stakingEnabled: checked })}
                />
              </div>
              <div>
                <Label htmlFor="stakeMin">Min Stake</Label>
                <Input
                  id="stakeMin"
                  type="number"
                  placeholder="100"
                  value={newStakingData.stakeMin || ''}
                  onChange={(e) => setNewStakingData({ ...newStakingData, stakeMin: parseFloat(e.target.value) || undefined })}
                />
              </div>
              <div>
                <Label htmlFor="stakeMax">Max Stake</Label>
                <Input
                  id="stakeMax"
                  type="number"
                  placeholder="10000"
                  value={newStakingData.stakeMax || ''}
                  onChange={(e) => setNewStakingData({ ...newStakingData, stakeMax: parseFloat(e.target.value) || undefined })}
                />
              </div>
              <div>
                <Label htmlFor="stakeRoi">ROI %</Label>
                <Input
                  id="stakeRoi"
                  type="number"
                  placeholder="5"
                  value={newStakingData.stakeRoi || ''}
                  onChange={(e) => setNewStakingData({ ...newStakingData, stakeRoi: parseFloat(e.target.value) || undefined })}
                />
              </div>
              <div>
                <Label htmlFor="stakeCycleDays">Cycle Duration</Label>
                <Select value={String(newStakingData.stakeCycleDays || '')} onValueChange={(value) => setNewStakingData({ ...newStakingData, stakeCycleDays: parseInt(value) || undefined })}>
                  <SelectTrigger id="stakeCycleDays">
                    <SelectValue placeholder="Select cycle duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddNew} className="w-full">Add Staking Option</Button>
            </div>
          </SheetContent>
        </Sheet>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead>Min Stake</TableHead>
              <TableHead>Max Stake</TableHead>
              <TableHead>ROI %</TableHead>
              <TableHead>Cycle Duration</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>{asset.symbol}</TableCell>
                <TableCell>{asset.name}</TableCell>
                {editing === asset.id ? (
                  <>
                    <TableCell>
                      <Switch
                        checked={editData.stakingEnabled || false}
                        onCheckedChange={(checked) => setEditData({ ...editData, stakingEnabled: checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editData.stakeMin || ''}
                        onChange={(e) => setEditData({ ...editData, stakeMin: parseFloat(e.target.value) || undefined })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editData.stakeMax || ''}
                        onChange={(e) => setEditData({ ...editData, stakeMax: parseFloat(e.target.value) || undefined })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editData.stakeRoi || ''}
                        onChange={(e) => setEditData({ ...editData, stakeRoi: parseFloat(e.target.value) || undefined })}
                      />
                    </TableCell>
                    <TableCell>
                      <Select value={String(editData.stakeCycleDays || '')} onValueChange={(value) => setEditData({ ...editData, stakeCycleDays: parseInt(value) || undefined })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cycle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 months</SelectItem>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleSave(asset.id)} className="mr-2">Save</Button>
                      <Button onClick={handleCancel} variant="outline">Cancel</Button>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{asset.stakingEnabled ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{asset.stakeMin || '-'}</TableCell>
                    <TableCell>{asset.stakeMax || '-'}</TableCell>
                    <TableCell>{asset.stakeRoi || '-'}</TableCell>
                    <TableCell>{asset.stakeCycleDays || '-'}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleEdit(asset)}>Edit</Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
