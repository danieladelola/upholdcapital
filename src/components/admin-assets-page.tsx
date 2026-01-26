import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Asset } from "@/lib/prisma/browser";

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    price_usd: '',
    logo_url: '',
    logoFile: null as File | null
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/admin/assets');
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let logoUrl = formData.logo_url;

      // Upload file if provided
      if (formData.logoFile) {
        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.logoFile);
        uploadFormData.append('symbol', formData.symbol.toUpperCase());

        const uploadResponse = await fetch('/api/upload/asset-icon', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload file');
        }

        const uploadedData = await uploadResponse.json();
        logoUrl = uploadedData.logoUrl;
        setIsUploading(false);
      }

      const url = editingAsset ? `/api/admin/assets/${editingAsset.id}` : '/api/admin/assets';
      const method = editingAsset ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: formData.symbol,
          name: formData.name,
          price_usd: parseFloat(formData.price_usd),
          logo_url: logoUrl || null,
        }),
      });

      if (response.ok) {
        toast({
          title: `Asset ${editingAsset ? 'updated' : 'created'} successfully`,
        });
        setIsDialogOpen(false);
        setEditingAsset(null);
        setFormData({ symbol: '', name: '', price_usd: '', logo_url: '', logoFile: null });
        fetchAssets();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save asset',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving asset:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save asset',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      symbol: asset.symbol,
      name: asset.name,
      price_usd: asset.priceUsd ? asset.priceUsd.toString() : '',
      logo_url: asset.logoUrl || '',
      logoFile: null
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const response = await fetch(`/api/admin/assets/${assetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Asset deleted successfully',
        });
        fetchAssets();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete asset',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete asset',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Asset Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingAsset(null);
              setFormData({ symbol: '', name: '', price_usd: '', logo_url: '', logoFile: null });
            }}>
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
              <p className="text-sm text-gray-500 hidden">Asset management form</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  placeholder="e.g., BTC, TSLA"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Bitcoin, Tesla"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price_usd">Price (USD)</Label>
                <Input
                  id="price_usd"
                  type="number"
                  step="0.01"
                  value={formData.price_usd}
                  onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="logo_file">Asset Icon (SVG)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    id="logo_file"
                    type="file"
                    accept=".svg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (!file.name.toLowerCase().endsWith('.svg')) {
                          toast({
                            title: 'Error',
                            description: 'Only SVG files are allowed',
                            variant: 'destructive',
                          });
                          return;
                        }
                        setFormData({ ...formData, logoFile: file });
                      }
                    }}
                  />
                  {formData.logoFile && (
                    <span className="text-sm text-green-600">✓ {formData.logoFile.name}</span>
                  )}
                </div>
                {formData.logo_url && !formData.logoFile && (
                  <p className="text-sm text-gray-500 mt-2">Current: {formData.logo_url}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? 'Uploading...' : editingAsset ? 'Update' : 'Create'} Asset
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price (USD)</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.symbol}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>${asset.priceUsd ? asset.priceUsd.toFixed(2) : '0.00'}</TableCell>
                  <TableCell>
                    {asset.logoUrl && (
                      <img src={asset.logoUrl} alt={asset.name} className="w-6 h-6" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(asset)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(asset.id)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}