'use server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type DealStatus = 'FILMING' | 'POST_NOW' | 'SIGNED' | 'PENDING' | 'NEGOTIATING' | 'BRIEF' | 'PREPROD' | 'WAITING' | 'NO_RESPONSE' | 'STALLED' | 'PASSED'
type DealSection = 'ACTIVE' | 'HOT' | 'INBOUND' | 'CLOSED'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  let dbUser = await prisma.user.findUnique({ where: { authId: user.id } })
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: { authId: user.id, email: user.email!, name: user.user_metadata?.name }
    })
  }
  return dbUser
}

export async function getDeals() {
  const user = await getUser()
  return prisma.deal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' }
  })
}

export async function createDeal(data: {
  name: string
  source?: string
  detail?: string
  amount?: string
  status?: DealStatus
  section?: DealSection
  postDate?: string
  action?: string
}) {
  const user = await getUser()
  await prisma.deal.create({ data: { ...data, userId: user.id } })
  revalidatePath('/deals')
}

export async function updateDeal(id: string, data: Partial<{
  name: string
  source: string
  detail: string
  amount: string
  amountSub: string
  status: DealStatus
  section: DealSection
  conceptApproved: boolean
  depositPaid: boolean
  contentCreated: boolean
  posted: boolean
  finalPaid: boolean
  postDate: string
  invoiceNotes: string
  requirements: string
  action: string
  notes: string
}>) {
  const user = await getUser()
  await prisma.deal.updateMany({ where: { id, userId: user.id }, data })
  revalidatePath('/deals')
}

export async function deleteDeal(id: string) {
  const user = await getUser()
  await prisma.deal.deleteMany({ where: { id, userId: user.id } })
  revalidatePath('/deals')
}
