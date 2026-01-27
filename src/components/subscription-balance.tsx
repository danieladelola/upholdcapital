import { DepositModal } from "./deposit-modal"

interface SubscriptionBalanceProps {
  balance: number,
  onDeposit: (amount: number, image: string, method: string, type: string, crypto?: string, network?: string, txHash?: string, address?: string) => void,
  bankDetails: any,
  cryptoDetails: any
}

export function SubscriptionBalance({ balance, onDeposit,bankDetails,cryptoDetails }: SubscriptionBalanceProps) {
  // DepositModal now calls onDeposit(amount, crypto, network, file)
  // Wrap the provided onDeposit (legacy signature) so existing callers still work.
  const handleModalDeposit = (amount: number, crypto: string, network: string, file: File) => {
    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result as string;
      // image = base64, method = 'Crypto', type = 'subscription', address empty
      onDeposit(amount, base64Image, "Crypto", "subscription", crypto, network, "", "")
    };
    reader.readAsDataURL(file);
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

