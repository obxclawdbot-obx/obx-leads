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

  const searches = await prisma.savedSearch.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(searches)
}

export async function POST(req: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { name, filters } = await req.json()
  if (!name) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })

  const search = await prisma.savedSearch.create({
    data: { name, filters: JSON.stringify(filters || {}), userId },
  })
  return NextResponse.json(search, { status: 201 })
}

export async function DELETE(req: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  await prisma.savedSearch.deleteMany({ where: { id, userId } })
  return NextResponse.json({ ok: true })
}
