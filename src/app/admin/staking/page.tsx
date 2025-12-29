
import StakingOptionsManagement from '@/components/staking-options-management'
import { checkAdmin } from '@/lib/check-admin'

export default async function AdminStakingPage() {
  await checkAdmin()

  return (
    <div className="container mx-auto py-8">
      <StakingOptionsManagement />
    </div>
  )
}
