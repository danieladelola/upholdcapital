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

interface DepositModalProps {
  onDeposit: (amount: number, crypto: string, network: string, txHash: string) => void;
}

const SUPPORTED_CRYPTOS = [
  "BTC",
  "ETH",
  "USDT",
  "USDC",
  "SOL",
  "TRX"
] as const;

const NETWORKS_CONFIG = {
  BTC: [
    {
      id: "BTC",
      name: "Bitcoin",
      address: "bc1q2vn9hhsdgej2p8jd89wfnfj85kfgy9adh7vyxs"
    }
  ],
  ETH: [
    {
      id: "ERC20",
      name: "ERC20 (Ethereum)",
      address: "0x1979B6A224074DfC7C05289b260af113F198a5bD"
    }
  ],
  USDT: [
    {
      id: "ERC20",
      name: "ERC20",
      address: "0x1979B6A224074DfC7C05289b260af113F198a5bD"
    },
    {
      id: "TRC20",
      name: "TRC20",
      address: "TSUGbqhpf4J4YAEL8Lt6kGTBoJbukHseNu"
    }
  ],
  USDC: [
    {
      id: "ERC20",
      name: "ERC20",
      address: "0x1979B6A224074DfC7C05289b260af113F198a5bD"
    }
  ],
  SOL: [
    {
      id: "SOL",
      name: "Solana",
      address: "DZN8jHdpAC5NsoXtYN8ZeYPxqxKmceXUPGa4fPo6CkzV"
    }
  ],
  TRX: [
    {
      id: "TRC20",
      name: "TRC20 (TRON)",
      address: "TSUGbqhpf4J4YAEL8Lt6kGTBoJbukHseNu"
    }
  ]
} as const;

export function DepositModal({ onDeposit }: DepositModalProps) {
  const [open, setOpen] = useState(false);
  const [crypto, setCrypto] = useState<typeof SUPPORTED_CRYPTOS[number]>(SUPPORTED_CRYPTOS[0]);
  // network can be different id strings (BTC, ERC20, TRC20, SOL, etc.) — use a wider string type
  const [network, setNetwork] = useState<string>(NETWORKS_CONFIG[SUPPORTED_CRYPTOS[0]][0].id);
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");

  // Update network when crypto changes
  useEffect(() => {
    const networks = NETWORKS_CONFIG[crypto as keyof typeof NETWORKS_CONFIG];
    if (networks?.length > 0) {
      setNetwork(networks[0].id);
    }
  }, [crypto]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDeposit(parseFloat(amount), crypto, network, txHash);
    setOpen(false);
  };

  const getCurrentAddress = () => {
    const networks = NETWORKS_CONFIG[crypto as keyof typeof NETWORKS_CONFIG];
    return networks?.find(n => n.id === network)?.address || "";
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="crypto-select">Cryptocurrency</Label>
              <Select 
                value={crypto} 
                onValueChange={(value) => setCrypto(value as typeof SUPPORTED_CRYPTOS[number])}
              >
                <SelectTrigger id="crypto-select">
                  <SelectValue placeholder="Select cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CRYPTOS.map((coin) => (
                    <SelectItem key={coin} value={coin}>
                      {coin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="network-select">Network</Label>
              <Select value={network} onValueChange={setNetwork}>
                <SelectTrigger id="network-select">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {NETWORKS_CONFIG[crypto as keyof typeof NETWORKS_CONFIG]?.map((net) => (
                    <SelectItem key={net.id} value={net.id}>
                      {net.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Deposit Address</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={getCurrentAddress()}
                  readOnly
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(getCurrentAddress())}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

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

            <Button type="submit" className="w-full">
              Confirm Deposit
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}