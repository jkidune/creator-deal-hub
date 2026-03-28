'use server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

export async function getProjects() {
  const user = await getUser()
  return prisma.project.findMany({
    where: { userId: user.id },
    include: { items: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'asc' }
  })
}

export async function createProject(data: { title: string; description?: string }) {
  const user = await getUser()
  const project = await prisma.project.create({ data: { ...data, userId: user.id }, include: { items: true } })
  revalidatePath('/projects')
  return project
}

export async function addProjectItem(projectId: string, text: string) {
  const user = await getUser()
  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } })
  if (!project) throw new Error('Not found')
  const item = await prisma.projectItem.create({ data: { projectId, text } })
  revalidatePath('/projects')
  return item
}

export async function toggleProjectItem(itemId: string) {
  const item = await prisma.projectItem.findUnique({ where: { id: itemId }, include: { project: true } })
  if (!item) throw new Error('Not found')
  await prisma.projectItem.update({ where: { id: itemId }, data: { done: !item.done } })
  revalidatePath('/projects')
}

export async function deleteProject(id: string) {
  const user = await getUser()
  await prisma.project.deleteMany({ where: { id, userId: user.id } })
  revalidatePath('/projects')
}
