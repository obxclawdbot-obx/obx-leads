import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function getUserId() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  return (session.user as { id?: string }).id || null
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const list = await prisma.list.findFirst({
    where: { id, userId },
    include: { companies: { include: { company: true }, orderBy: { addedAt: 'desc' } } },
  })

  if (!list) return NextResponse.json({ error: 'Lista no encontrada' }, { status: 404 })
  return NextResponse.json(list)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.list.deleteMany({ where: { id, userId } })
  return NextResponse.json({ ok: true })
}
