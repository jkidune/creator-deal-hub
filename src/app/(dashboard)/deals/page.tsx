import { getDeals } from '@/app/actions/deals'
import DealsClient from './DealsClient'

export default async function DealsPage() {
  const deals = await getDeals()
  return <DealsClient initialDeals={deals} />
}
