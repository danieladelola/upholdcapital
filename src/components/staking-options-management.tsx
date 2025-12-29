"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<AssetStaking>>({})

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    const res = await fetch('/api/admin/staking-options')
    if (res.ok) {
      const data = await res.json()
      setAssets(data)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Staking Options</CardTitle>
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
              <TableHead>Cycle Days</TableHead>
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
                      <Input
                        type="number"
                        value={editData.stakeCycleDays || ''}
                        onChange={(e) => setEditData({ ...editData, stakeCycleDays: parseInt(e.target.value) || undefined })}
                      />
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
