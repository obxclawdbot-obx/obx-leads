import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function getUserId() {
  const session = await getSession()
  if (!session) return null
  return session.id || null
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const { companyId } = await req.json()

  const list = await prisma.list.findFirst({ where: { id, userId } })
  if (!list) return NextResponse.json({ error: 'Lista no encontrada' }, { status: 404 })

  try {
    const entry = await prisma.listCompany.create({ data: { listId: id, companyId } })
    return NextResponse.json(entry, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'La empresa ya está en la lista' }, { status: 400 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const { companyId } = await req.json()

  const list = await prisma.list.findFirst({ where: { id, userId } })
  if (!list) return NextResponse.json({ error: 'Lista no encontrada' }, { status: 404 })

  await prisma.listCompany.deleteMany({ where: { listId: id, companyId } })
  return NextResponse.json({ ok: true })
}
