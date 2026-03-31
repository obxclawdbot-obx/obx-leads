// @ts-nocheck
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function getUserId() {
  const session = await getSession()
  if (!session) return null
  return session.id || null
}

function buildCsv(companies: any[]) {
  const headers = ['CIF', 'Nombre', 'Ciudad', 'Provincia', 'Sector', 'Empleados', 'Email', 'Teléfono', 'Web']
  const rows = companies.map(c => [
    c.cif || '',
    c.name || '',
    c.city || '',
    c.provincia || '',
    c.cnaeDescription || '',
    c.employees != null ? String(c.employees) : '',
    c.email || '',
    c.phone || '',
    c.website || '',
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'))

  return [headers.join(';'), ...rows].join('\n')
}

export async function GET(req: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query') || searchParams.get('q') || ''
  const provincia = searchParams.get('provincia') || ''
  const cnae = searchParams.get('cnae') || ''
  const minEmployees = searchParams.get('minEmployees') || ''
  const maxEmployees = searchParams.get('maxEmployees') || ''

  const where: any = {}
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { cif: { contains: query } },
    ]
  }
  if (provincia) where.provincia = { contains: provincia }
  if (cnae) where.cnaeDescription = { contains: cnae }
  if (minEmployees) where.employees = { ...where.employees, gte: parseInt(minEmployees) }
  if (maxEmployees) where.employees = { ...where.employees, lte: parseInt(maxEmployees) }

  const companies = await prisma.company.findMany({ where, orderBy: { name: 'asc' }, take: 5000 })
  const csv = buildCsv(companies)

  await prisma.exportLog.create({
    data: { userId, type: 'search', count: companies.length },
  })

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="obx-leads-export-${Date.now()}.csv"`,
    },
  })
}

export async function POST(req: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { type, listId, companyIds } = await req.json()

  let companies
  if (type === 'list' && listId) {
    const list = await prisma.list.findFirst({
      where: { id: listId, userId },
      include: { companies: { include: { company: true } } },
    })
    if (!list) return NextResponse.json({ error: 'Lista no encontrada' }, { status: 404 })
    companies = list.companies.map((lc: any) => lc.company)
  } else if (companyIds?.length) {
    companies = await prisma.company.findMany({ where: { id: { in: companyIds } } })
  } else {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const csv = buildCsv(companies)

  await prisma.exportLog.create({
    data: { userId, type: type || 'search', count: companies.length },
  })

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="obx-leads-export-${Date.now()}.csv"`,
    },
  })
}
