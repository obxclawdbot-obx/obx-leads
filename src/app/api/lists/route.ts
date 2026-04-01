import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { getMaxLists } from '@/lib/plans'

async function getUserId() {
  const session = await getSession()
  if (!session) return null
  return { id: session.id, plan: session.plan || 'starter' }
}

export async function GET() {
  const user = await getUserId()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const lists = await prisma.list.findMany({
    where: { userId: user.id },
    include: { _count: { select: { companies: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(lists)
}

export async function POST(req: Request) {
  const user = await getUserId()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })

  // Check list limit
  const maxLists = getMaxLists(user.plan)
  if (maxLists !== -1) {
    const currentCount = await prisma.list.count({ where: { userId: user.id } })
    if (currentCount >= maxLists) {
      return NextResponse.json({ error: `Límite de listas alcanzado (${maxLists}). Upgrade tu plan.` }, { status: 403 })
    }
  }

  const list = await prisma.list.create({ data: { name, userId: user.id } })
  return NextResponse.json(list, { status: 201 })
}
