import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PartnershipsClient from './PartnershipsClient'

export default async function PartnershipsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const dbUser = await prisma.user.findUnique({ where: { authId: user.id } })
  const partnerships = dbUser ? await prisma.partnership.findMany({
    where: { userId: dbUser.id },
    include: {
      deadlines: { orderBy: { dueDate: 'asc' } },
      speakingSlots: { orderBy: { eventDate: 'asc' } },
      products: { orderBy: { createdAt: 'asc' } }
    },
    orderBy: { createdAt: 'asc' }
  }) : []
  return <PartnershipsClient initialPartnerships={partnerships} />
}
