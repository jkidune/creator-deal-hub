import { getAlerts } from '@/app/actions/alerts'
import AlertsClient from './AlertsClient'

export default async function AlertsPage() {
  const alerts = await getAlerts()
  return <AlertsClient initialAlerts={alerts} />
}
