'use server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type AlertType = 'DANGER' | 'WARNING' | 'GOOD' | 'INFO'

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

export async function getAlerts() {
  const user = await getUser()
  return prisma.alert.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createAlert(data: { type: AlertType; title: string; body?: string }) {
  const user = await getUser()
  await prisma.alert.create({ data: { ...data, userId: user.id } })
  revalidatePath('/alerts')
}

export async function resolveAlert(id: string) {
  const user = await getUser()
  await prisma.alert.updateMany({ where: { id, userId: user.id }, data: { resolved: true } })
  revalidatePath('/alerts')
}

export async function deleteAlert(id: string) {
  const user = await getUser()
  await prisma.alert.deleteMany({ where: { id, userId: user.id } })
  revalidatePath('/alerts')
}
