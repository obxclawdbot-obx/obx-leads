import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stringify } from 'csv-stringify/sync'

async function getUserId() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  return (session.user as { id?: string }).id || null
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
    companies = list.companies.map((lc) => lc.company)
  } else if (companyIds?.length) {
    companies = await prisma.company.findMany({ where: { id: { in: companyIds } } })
  } else {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const rows = companies.map((c) => ({
    CIF: c.cif,
    Nombre: c.name,
    'Forma Jurídica': c.legalForm || '',
    'Año Fundación': c.foundedYear || '',
    Dirección: c.address || '',
    CP: c.postalCode || '',
    Ciudad: c.city || '',
    Provincia: c.provincia || '',
    CCAA: c.ccaa || '',
    'CNAE Código': c.cnaeCode || '',
    'CNAE Descripción': c.cnaeDescription || '',
    Empleados: c.employees || '',
    'Facturación (€)': c.revenue || '',
    Teléfono: c.phone || '',
    Email: c.email || '',
    Web: c.website || '',
    LinkedIn: c.linkedinUrl || '',
    Twitter: c.twitterUrl || '',
  }))

  const csv = stringify(rows, { header: true, delimiter: ';' })

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
