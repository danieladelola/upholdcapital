"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { Asset } from "../../types"
import { db,fire } from "@/lib/firebase"
import { useUser } from "@clerk/nextjs"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"



type TradeType = "Buy" | "Sell" | "Convert"
type AssetType = "Crypto" | "Stock"
import { useToast } from "@/hooks/use-toast"
import { User } from "@clerk/nextjs/server"



export function TradingControls({assets,userBalance,user}: {assets: Asset[],userBalance:number,user:User}) {
  const [tradeType, setTradeType] = useState<TradeType>("Buy")
  const [amount, setAmount] = useState("")
  const [targetasset, setTargetAsset] = useState("")
  const [asset, setAsset] = useState<Asset>()
  const {toast} = useToast()
  useEffect(() => {
    if(targetasset){
      const asset = assets.find(a => a.symbol === targetasset)
      setAsset(asset)
    }
  },[targetasset])

  const handleTrade = async () => {
    console.log(`${tradeType} ${amount} ${asset}`)
    if(!asset){
      toast({
        title: `Select an asset`
      })
      return
    }
    // handle the buy or sell logic and update the assets subcolelction
    // get the current price of the asset and update the
    // user balance accordingly
    if((asset.price*parseFloat(amount) > userBalance)&&tradeType.toLocaleLowerCase() == 'buy'){
      toast({
        title: `Insufficient funds`
      })
  }else{

      if(tradeType.toLowerCase() === 'buy'){
        const assetRef = db.collection('users').doc(user.id).collection('assets').doc(asset.symbol)
        await db.collection('users').doc(user.id).collection('trades').add({
          date: new Date().toISOString(),
          asset: asset,
          amount: parseFloat(amount),
          value: asset.price*parseFloat(amount),
          action: tradeType,
          filled: true
        }).then(()=>{
          console.log("trade created")
        })
        db.collection('users').doc(user.id).update({
          balance: userBalance - asset.price*parseFloat(amount)
        })
        assetRef.get().then((doc)=>{
          if(doc.exists){
            assetRef.update({amount:fire.firestore.FieldValue.increment(parseFloat(amount))}).then(val=>{
              toast({
                title: `Bought ${amount} $${asset.symbol}`
              })

            })

          }else{
            assetRef.set({name:asset.name,amount:parseFloat(amount)})
          }
        })
      }else{
        await  db.collection('users').doc(user.id).collection('trades').add({
          date: new Date().toISOString(),
          asset: asset,
          amount: parseFloat(amount),
          value: asset.price*parseFloat(amount),
          action: tradeType,
          filled: true
        })
        const assetRef = db.collection('users').doc(user.id).collection('assets').doc(asset.symbol)
        assetRef.get().then((doc)=>{
          if(doc.exists){
            if(doc.exists && doc.data()?.amount as number >= parseFloat(amount)){
              assetRef.update({amount:fire.firestore.FieldValue.increment(-(parseFloat(amount)))})
            }else{
              toast({
                title:"insufficient quantity of selected asset",
                description:"Sell amount cannot be greater than balance"
              })
            }
          }
        })
      db.collection('users').doc(user.id).update({
          balance: fire.firestore.FieldValue.increment( asset.price*parseFloat(amount))
        }).then(val=>{
          toast({
            title: `Sold ${asset.symbol}`,
            description: `Sold ${amount} of ${asset.symbol}`,
            variant: "default",
          })
        })
      }
    
  }}

  return (
    <Card className="sm:w-[400px] max-w-xs mx-auto w-full">
      <CardHeader>
        <CardTitle>Trading Controls</CardTitle>
      </CardHeader>
      <CardContent>

        <Tabs defaultValue="Buy" onValueChange={(value) => setTradeType(value as TradeType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="Buy">Buy</TabsTrigger>
            <TabsTrigger value="Sell">Sell</TabsTrigger>
            <TabsTrigger value="Convert">Convert</TabsTrigger>
          </TabsList>
          <TabsContent value="Buy">
            <TradeForm type="Buy" amount={amount} setAmount={setAmount} asset={targetasset} setAsset={setTargetAsset} onTrade={handleTrade} assets={assets} userBalance={userBalance} />
          </TabsContent>
          <TabsContent value="Sell">
            <TradeForm type="Sell" amount={amount} setAmount={setAmount} asset={targetasset} setAsset={setTargetAsset} onTrade={handleTrade} assets={assets} userBalance={userBalance} />
          </TabsContent>
          <TabsContent value="Convert">
            <ConvertForm assets={assets} uid={user?.id??''} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface TradeFormProps {
  type: "Buy" | "Sell"
  amount: string
  setAmount: (amount: string) => void
  asset: string
  setAsset: (asset: string) => void
  onTrade: () => void
  assets: Asset[],
  userBalance: number
}

function TradeForm({ type, amount, setAmount, asset, setAsset, onTrade,assets,userBalance }: TradeFormProps) {
  const [assetType, setAssetType] = useState<AssetType>("Crypto")
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [selectedAsset,setSelectedAsset] = useState<Asset|any>(null)
  useEffect(() => {
    // Ensure the initial filter works by checking the assetType at first render
    const newAssets = assets.filter((a) => a.type.toLowerCase() === assetType.toLowerCase());
    setFilteredAssets(newAssets);
  }, [assets]); // Only depend on assets to ensure it happens once

  // Update filtered assets whenever assetType changes
  useEffect(() => {
    const newAssets = assets.filter((a) => a.type.toLowerCase() === assetType.toLowerCase());
    setFilteredAssets(newAssets);
  }, [assetType, assets]); // Depend on both assetType and assets
  useEffect(()=>{
    const att = assets.find(a => a.symbol === asset)
    setSelectedAsset(att)
  },[asset])


  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="assetType">Type:</Label>
        <Select value={assetType} onValueChange={(value) => setAssetType(value as AssetType)}>
          <SelectTrigger id="assetType">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Crypto">Crypto</SelectItem>
            <SelectItem value="Stock">Stocks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount:</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="asset">Asset:</Label>
        <Select value={asset} onValueChange={(value)=>setAsset(value)}>
          <SelectTrigger id="asset">
            <SelectValue placeholder="Select asset" />
          </SelectTrigger>
          <SelectContent>
            {filteredAssets.map((a) => (
              <SelectItem key={a.symbol} value={a.symbol}>
                {a.name} ({a.symbol})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {
      <div className="space-y-2">
        <p className="text-sm">{type.toLocaleLowerCase() == 'buy'||!asset ?'Current USD balance:':`Current ${asset} balance` }</p>
  <p className="font-semibold">{type.toLocaleLowerCase() == 'buy'||!asset ?`$${userBalance.toLocaleString('en-US')}`:`${assets.find(value=>value.symbol === asset)?.amount}` }</p>
      </div>
      }

      {selectedAsset && (
        <div className="space-y-2">
          <p className="text-sm">Current {selectedAsset.symbol} price:</p>
          <p className="font-semibold">${selectedAsset.price.toFixed(2)}</p>
          <p>
            <span className="font-bold tex">
              {type.toLowerCase() =='buy'?'Cost:':'Total:'}
            </span>
             ${isNaN(parseFloat(selectedAsset.price )* parseFloat(amount)) ? 0 : (selectedAsset.price * parseFloat(amount)).toLocaleString('en-US')}</p>
        </div>
      )}
            <AlertDialog>
      <AlertDialogTrigger asChild>
          <Button className="w-full" disabled={!selectedAsset}>
            {type} 
          </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sure to {type.toLocaleLowerCase()} of {asset} </AlertDialogTitle>
          <AlertDialogDescription>
          {
            selectedAsset&&(
            <>
            Sure to proceed? ${isNaN(selectedAsset.price * parseFloat(amount)) ? 0 : (selectedAsset.price * parseFloat(amount)).toLocaleString('en-US')} will be {type.toLowerCase() == "buy"? "added":"removed"} from your balance
            </>
          )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onTrade}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    </div>
  )
}

interface ConvertFormProps {
  assets: Asset[],
  uid:string
}

function ConvertForm({ assets,uid }: ConvertFormProps) {
  const [fromType, setFromType] = useState<AssetType>("Crypto")
  const [toType, setToType] = useState<AssetType>("Crypto")
  const [fromAsset, setFromAsset] = useState<string>("")
  const [toAsset, setToAsset] = useState<string>("")
  const [amount, setAmount] = useState<number>(0)
  const [convertedAmount, setConvertedAmount] = useState<string>("")
  const [filteredFrom,setFilteredFrom] = useState<Asset[]>([])
  const [filteredTo,setFilteredTo] = useState<Asset[]>([])
  const [fasset,setFasset] = useState<Asset>()
  const [tasset,setTasset] = useState<Asset>()
  const {toast} = useToast()
  useEffect(() => {
    const filteredFromAssets = assets.filter(asset => asset.type.toLowerCase() === fromType.toLocaleLowerCase())
    const filteredToAssets = assets.filter(asset => asset.type.toLowerCase() === toType.toLocaleLowerCase())
    setFilteredFrom(filteredFromAssets);
    setFilteredTo(filteredToAssets);
  }, [assets]); // Only depend on assets to ensure it happens once
  useEffect(()=>{
    if(fromAsset.length){
      const fromAssetData = assets.find(a => a.symbol === fromAsset)
      setFasset(fromAssetData)
    }
    if(toAsset.length){
      const toAssetData = assets.find(a => a.symbol === toAsset)
      setTasset(toAssetData)
    }
  },[fromAsset,toAsset])
  // Update filtered assets whenever assetType changes
  useEffect(() => {
    const filteredFromAssets = assets.filter(asset => asset.type === fromType.toLocaleLowerCase())
    const filteredToAssets = assets.filter(asset => asset.type === toType.toLocaleLowerCase())
    setFilteredFrom(filteredFromAssets);
    setFilteredTo(filteredToAssets);
  }, [fromType,toType]); // Depend on both assetType and assets

  useEffect(()=>{
    const fromAssetData = assets.find(a => a.symbol === fromAsset)
    const toAssetData = assets.find(a => a.symbol === toAsset)

    if (fromAssetData && toAssetData && amount) {
      const usdValue = amount * fromAssetData.price
      const convertedValue = usdValue / toAssetData.price
      setConvertedAmount(convertedValue.toFixed(3))
    } else {
      setConvertedAmount("")
    }
  },[amount, fromAsset, toAsset, assets])
  const handleConvert = async() => {
    const fromAssetData = assets.find(a => a.symbol === fromAsset)
    const toAssetData = assets.find(a => a.symbol === toAsset)

    if (fromAssetData && toAssetData && amount) {
      // user must have at least `amount` of the fromAsset
      if ((fromAssetData.amount ?? 0) >= amount) {
        const usdValue = amount * fromAssetData.price
        const convertedValue = usdValue / toAssetData.price

        // decrement fromAsset
        await db.collection('users').doc(uid).collection('assets').doc(fromAsset).update({
          amount: fire.firestore.FieldValue.increment(-amount)
        })

        // increment or create toAsset document
        const toRef = db.collection('users').doc(uid).collection('assets').doc(toAsset)
        const toDoc = await toRef.get()
        if (toDoc.exists) {
          await toRef.update({ amount: fire.firestore.FieldValue.increment(convertedValue) })
        } else {
          // create the asset document with the converted amount and a best-effort name
          await toRef.set({ name: toAssetData.name ?? toAssetData.symbol, amount: convertedValue })
        }

        setConvertedAmount(convertedValue.toFixed(3))
        toast({ title: 'Conversion successful', description: `${amount} ${fromAsset} → ${Number(convertedValue.toFixed(3))} ${toAsset}` })
      } else {
        toast({
          title: "insufficient balance",
          description: "You do not have enough liquidity for this transaction"
        })
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fromType">From Type:</Label>
          <Select value={fromType} onValueChange={(value) => setFromType(value as AssetType)}>
            <SelectTrigger id="fromType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Crypto">Crypto</SelectItem>
              <SelectItem value="Stock">Stocks</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="toType">To Type:</Label>
          <Select value={toType} onValueChange={(value) => setToType(value as AssetType)}>
            <SelectTrigger id="toType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Crypto">Crypto</SelectItem>
              <SelectItem value="Stock">Stocks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fromAsset">From Asset:</Label>
          <Select value={fromAsset} onValueChange={setFromAsset}>
            <SelectTrigger id="fromAsset">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {filteredFrom.map(asset => (
                <SelectItem key={asset.symbol} value={asset.symbol}>
                  {asset.name} ({asset.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {
            fasset&&(
              <div className="text-xs font-semibold">
                {fasset.amount} available.
              </div>
            )
          }
        </div>
        <div className="space-y-2">
          <Label htmlFor="toAsset">To Asset:</Label>
          <Select value={toAsset} onValueChange={setToAsset}>
            <SelectTrigger id="toAsset">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {filteredTo.map(asset => (
                <SelectItem key={asset.symbol} value={asset.symbol}>
                  {asset.name} ({asset.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {
            tasset&&(
              <div className="text-xs font-semibold">
                {tasset.amount} available.
              </div>
            )
          }
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount:</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          max={fasset?.amount??0}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          placeholder="Enter amount to convert"
        />
      </div>

      <Button className="w-full" onClick={handleConvert}>
        Convert
      </Button>

      {convertedAmount && (
        <div className="space-y-2">
          <Label>Converted Amount:</Label>
          <p className="font-semibold">{convertedAmount} {toAsset}</p>
        </div>
      )}
    </div>
  )
}

