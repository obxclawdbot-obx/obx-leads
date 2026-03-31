// @ts-nocheck
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function getUserId() {
  const session = await getSession()
  if (!session) return null
  return session.id || null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const lists = await prisma.list.findMany({
    where: { userId },
    include: { _count: { select: { companies: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(lists)
}

export async function POST(req: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })

  const list = await prisma.list.create({ data: { name, userId } })
  return NextResponse.json(list, { status: 201 })
}
