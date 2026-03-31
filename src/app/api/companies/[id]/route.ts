import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'


export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const company = await prisma.company.findUnique({ where: { id } })
  if (!company) {
    return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })
  }

  const userId = (session as { id?: string }).id
  if (userId) {
    await prisma.activityLog.create({
      data: { userId, action: 'view_company', metadata: JSON.stringify({ companyId: id, companyName: company.name }) },
    })
  }

  return NextResponse.json(company)
}
