'use server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ProductStatus = 'IN_PROGRESS' | 'ITERATING' | 'DEVELOPMENT' | 'DONE'

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

export async function createPartnership(data: {
  brandName: string
  dealValue?: string
  type?: string
  notes?: string
}) {
  const user = await getUser()
  const p = await prisma.partnership.create({ data: { ...data, userId: user.id } })
  revalidatePath('/partnerships')
  return p
}

export async function addDeadline(partnershipId: string, dueDate: string, task: string) {
  const user = await getUser()
  const partnership = await prisma.partnership.findFirst({ where: { id: partnershipId, userId: user.id } })
  if (!partnership) throw new Error('Not found')
  const deadline = await prisma.deadline.create({ data: { partnershipId, dueDate: new Date(dueDate), task } })
  revalidatePath('/partnerships')
  return deadline
}

export async function toggleDeadline(id: string) {
  const deadline = await prisma.deadline.findUnique({
    where: { id },
    include: { partnership: true }
  })
  if (!deadline) throw new Error('Not found')
  await prisma.deadline.update({ where: { id }, data: { done: !deadline.done } })
  revalidatePath('/partnerships')
}

export async function addSpeakingSlot(partnershipId: string, data: {
  brand: string
  eventDate: string
  timeSlot?: string
  fee?: string
  notes?: string
}) {
  const user = await getUser()
  const partnership = await prisma.partnership.findFirst({ where: { id: partnershipId, userId: user.id } })
  if (!partnership) throw new Error('Not found')
  const slot = await prisma.speakingSlot.create({
    data: {
      partnershipId,
      brand: data.brand,
      eventDate: new Date(data.eventDate),
      timeSlot: data.timeSlot,
      fee: data.fee,
      notes: data.notes,
    }
  })
  revalidatePath('/partnerships')
  return slot
}

export async function addProduct(partnershipId: string, name: string, status: ProductStatus = 'IN_PROGRESS') {
  const user = await getUser()
  const partnership = await prisma.partnership.findFirst({ where: { id: partnershipId, userId: user.id } })
  if (!partnership) throw new Error('Not found')
  const product = await prisma.partnerProduct.create({ data: { partnershipId, name, status } })
  revalidatePath('/partnerships')
  return product
}

export async function updateProductStatus(id: string, status: ProductStatus) {
  await prisma.partnerProduct.update({ where: { id }, data: { status } })
  revalidatePath('/partnerships')
}

export async function deletePartnership(id: string) {
  const user = await getUser()
  await prisma.partnership.deleteMany({ where: { id, userId: user.id } })
  revalidatePath('/partnerships')
}
