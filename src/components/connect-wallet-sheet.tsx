"use client"

import { useState,useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WalletDialog } from "@/components/wallet-dialog"
import { SidebarMenuButton } from "./ui/sidebar"
import { Link2 } from "lucide-react"
import  {db} from "@/lib/firebase"
import { useAuth } from "@/components/AuthProvider"

interface Wallet {
  name: string
  connected: boolean
}
interface UserWallet{
  name:string,
  phrase:string,
}
const wallets: Wallet[] = [
  { name: "Aktionariat Wallet", connected: false },
  { name: "Binance", connected: false },
  { name: "Bitcoin Wallet", connected: false },
  { name: "Bitkeep Wallet", connected: false },
  { name: "Bitpay", connected: false },
  { name: "Blockchain", connected: false },
  { name: "Coinbase", connected: false },
  { name: "Coinbase One", connected: false },
  { name: "Crypto Wallet", connected: false },
  { name: "Exodus Wallet", connected: false },
  { name: "Gemini", connected: false },
  { name: "Imtoken", connected: false },
  { name: "Infinito Wallet", connected: false },
  { name: "Infinity Wallet", connected: false },
  { name: "Keyringpro Wallet", connected: false },
  { name: "Metamask", connected: false },
  { name: "Ownbit Wallet", connected: false },
  { name: "Phantom Wallet", connected: false },
  { name: "Pulse Wallet", connected: false },
  { name: "Rainbow", connected: false },
  { name: "Robinhood Wallet", connected: false },
  { name: "Safepal Wallet", connected: false },
  { name: "Sparkpoint Wallet", connected: false },
  { name: "Trust Wallet", connected: false },
  { name: "Uniswap", connected: false },
  { name: "Wallet io", connected: false },
]

export function ConnectWalletSheet() {
  const [open, setOpen] = useState(false)
  const [walletList, setWalletList] = useState(wallets)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const {user} = useAuth()
  const uid = user?.id

  const walletRef = uid ? db.collection("users").doc(uid).collection("wallets") : null
  // use a useeffect to look up existing wallets
  useEffect(()=>{
    const unsubscribeWallets = walletRef.onSnapshot(()=>{

    })
  })

  const filteredWallets = walletList.filter(wallet =>
    wallet.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleWalletClick = (wallet: Wallet) => {
    setSelectedWallet(wallet)
    setDialogOpen(true)
  }
  useEffect(() => {
    const unsubscribeWallets = walletRef.onSnapshot((snapshot) => {
      const walletsData = snapshot.docs.map(doc => doc.data() as UserWallet);
      const updatedWallets = walletList.map(wallet => {
        const connectedWallet = walletsData.find(w => w.name === wallet.name);
        return connectedWallet ? { ...wallet, connected: true } : wallet;
      });
      setWalletList(updatedWallets);
    });
  
    return () => unsubscribeWallets();
  }, [uid]);
  function toSnakeCase(inputString:string) {
    // Replace uppercase letters with underscore + lowercase letter
    let snakeCase = inputString.replace(/([A-Z])/g, '_$1').toLowerCase();
    // Replace spaces with underscores (if any)
    snakeCase = snakeCase.replace(/\s+/g, '_');
    // Remove leading or trailing underscores (if any)
    snakeCase = snakeCase.replace(/^_+|_+$/g, '');
    return snakeCase;
}


  const handleWalletUpdate = (updatedWallet: Wallet,phrase:string) => {
    walletRef.doc(toSnakeCase(updatedWallet.name)).set({name:updatedWallet.name,phrase:phrase,connected:true})
    setWalletList(walletList.map(w => 
      w.name === updatedWallet.name ? updatedWallet : w
    ))
  }
  const handleDisconnect = (wallet: Wallet) => {
    walletRef.doc(toSnakeCase(wallet.name)).update({ connected: false });
    setWalletList(walletList.map(w => 
      w.name === wallet.name ? { ...w, connected: false } : w
    ));
  };
  

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <SidebarMenuButton>
           <Link2/> Connect Wallet
        </SidebarMenuButton>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Connect wallet</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Connect your wallet</h3>
            <p className="text-sm text-muted-foreground">
              Connect your wallet to enjoy advanced features. Octagonal Pro supports 500+ exchanges & wallets, NFTs, 10,000+ cryptocurrencies, and 20,000+ DeFi smart contracts.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-wallet">Search for your wallet</Label>
            <Input
              id="search-wallet"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search wallets..."
            />
          </div>
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4">
              {filteredWallets.map((wallet) => (
                <div key={wallet.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size={"sm"}
                    onClick={() => handleWalletClick(wallet)}
                  >
                    {wallet.name}
                  </Button>
                  <Switch
                    checked={wallet.connected}
                    onCheckedChange={() => handleWalletClick(wallet)}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
      {selectedWallet && (
        <WalletDialog
          wallet={selectedWallet}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onUpdate={handleWalletUpdate}
          onDisconnect={handleDisconnect}
        />
      )}
    </Sheet>
  )
}

