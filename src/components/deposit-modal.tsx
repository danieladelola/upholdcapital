"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "@/hooks/use-toast";

interface DepositMethod {
  id: string;
  name: string;
  enabled: boolean;
  description: string | null;
  cryptoType: string | null;
  network: string | null;
  networkName: string | null;
  address: string | null;
}

interface DepositModalProps {
  onDeposit: (amount: number, crypto: string, network: string, txHash: string) => void;
}

export function DepositModal({ onDeposit }: DepositModalProps) {
  const [open, setOpen] = useState(false);
  const [methods, setMethods] = useState<DepositMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod | null>(null);
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepositMethods();
  }, []);

  const fetchDepositMethods = async () => {
    try {
      const res = await fetch('/api/admin/deposit-methods');
      if (res.ok) {
        const data = await res.json();
        const enabledMethods = data.filter((m: DepositMethod) => m.enabled);
        setMethods(enabledMethods);
        if (enabledMethods.length > 0) {
          setSelectedMethod(enabledMethods[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching deposit methods:', error);
      toast({ title: "Error", description: "Failed to load deposit methods" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return;
    onDeposit(parseFloat(amount), selectedMethod.cryptoType || '', selectedMethod.network || '', txHash);
    setOpen(false);
    setAmount("");
    setTxHash("");
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Address copied to clipboard" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Deposit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deposit</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] w-full">
          {loading ? (
            <div className="p-4">Loading deposit methods...</div>
          ) : methods.length === 0 ? (
            <div className="p-4">No deposit methods available. Please contact support.</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 p-4">
              <div className="space-y-2">
                <Label htmlFor="method-select">Deposit Method</Label>
                <Select 
                  value={selectedMethod?.id || ''} 
                  onValueChange={(methodId) => {
                    const method = methods.find(m => m.id === methodId);
                    setSelectedMethod(method || null);
                  }}
                >
                  <SelectTrigger id="method-select">
                    <SelectValue placeholder="Select deposit method" />
                  </SelectTrigger>
                  <SelectContent>
                    {methods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name} {method.cryptoType && `(${method.cryptoType})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMethod && (
                <>
                  {selectedMethod.description && (
                    <div className="text-sm text-muted-foreground">
                      {selectedMethod.description}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Network</Label>
                    <div className="text-sm">
                      {selectedMethod.networkName || selectedMethod.network || 'N/A'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Deposit Address</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={selectedMethod.address || ''}
                        readOnly
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(selectedMethod.address || '')}
                        disabled={!selectedMethod.address}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="0"
                    step="any"
                    required
                  />
                  <span>USD</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tx-hash">Transaction Hash</Label>
                <Input
                  id="tx-hash"
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Enter transaction hash"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={!selectedMethod}>
                Confirm Deposit
              </Button>
            </form>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}