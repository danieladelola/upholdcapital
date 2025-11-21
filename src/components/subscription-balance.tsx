import { DepositModal } from "./deposit-modal"

interface SubscriptionBalanceProps {
  balance: number,
  onDeposit: (amount: number, image: string, method: string, type: string, crypto?: string, network?: string, txHash?: string, address?: string) => void,
  bankDetails: any,
  cryptoDetails: any
}

export function SubscriptionBalance({ balance, onDeposit,bankDetails,cryptoDetails }: SubscriptionBalanceProps) {
  // DepositModal now calls onDeposit(amount, crypto, network, txHash)
  // Wrap the provided onDeposit (legacy signature) so existing callers still work.
  const handleModalDeposit = (amount: number, crypto: string, network: string, txHash: string) => {
    // image empty, method = 'Crypto', type = 'subscription', address empty
    onDeposit(amount, "", "Crypto", "subscription", crypto, network, txHash, "")
  }
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold">Subscription Balance</h2>
        <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
      </div>
      <DepositModal onDeposit={handleModalDeposit} />
    </div>
  )
}

