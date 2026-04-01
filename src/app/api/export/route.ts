import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { getExportLimit } from '@/lib/plans'

function buildCsv(companies: Array<Record<string, unknown>>) {
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

async function checkExportLimit(userId: string, plan: string, count: number): Promise<string | null> {
  const limit = getExportLimit(plan);
  if (limit === -1) return null; // unlimited

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const used = await prisma.exportLog.aggregate({
    where: { userId, createdAt: { gte: startOfMonth } },
    _sum: { count: true },
  });

  const totalUsed = (used._sum.count || 0) + count;
  if (totalUsed > limit) {
    return `Límite de exportación alcanzado (${used._sum.count || 0}/${limit} este mes). Upgrade tu plan.`;
  }
  return null;
}

export async function GET(req: Request) {
  const session = await getSession()
  if (!session?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query') || searchParams.get('q') || ''
  const provincia = searchParams.get('provincia') || ''
  const cnae = searchParams.get('cnae') || ''
  const minEmployees = searchParams.get('minEmployees') || ''
  const maxEmployees = searchParams.get('maxEmployees') || ''

  const where: Record<string, unknown> = {}
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { cif: { contains: query, mode: 'insensitive' } },
    ]
  }
  if (provincia) where.provincia = { contains: provincia, mode: 'insensitive' }
  if (cnae) where.cnaeDescription = { contains: cnae, mode: 'insensitive' }
  if (minEmployees || maxEmployees) {
    const emp: Record<string, number> = {}
    if (minEmployees) emp.gte = parseInt(minEmployees)
    if (maxEmployees) emp.lte = parseInt(maxEmployees)
    where.employees = emp
  }

  try {
    const companies = await prisma.company.findMany({ where, orderBy: { name: 'asc' }, take: 5000 })

    // Check export limit
    const limitErr = await checkExportLimit(session.id, session.plan || 'starter', companies.length);
    if (limitErr) {
      return NextResponse.json({ error: limitErr }, { status: 403 });
    }

    const csv = buildCsv(companies as unknown as Array<Record<string, unknown>>)

    prisma.exportLog.create({
      data: { userId: session.id, type: 'search', count: companies.length },
    }).catch(() => {})

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="obx-leads-export-${Date.now()}.csv"`,
      },
    })
  } catch (e) {
    console.error('Export error:', e)
    return NextResponse.json({ error: 'Error en la exportación' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { type, listId, companyIds } = await req.json()

  try {
    let companies: Array<Record<string, unknown>>
    if (type === 'list' && listId) {
      const list = await prisma.list.findFirst({
        where: { id: listId, userId: session.id },
        include: { companies: { include: { company: true } } },
      })
      if (!list) return NextResponse.json({ error: 'Lista no encontrada' }, { status: 404 })
      companies = list.companies.map((lc) => lc.company as unknown as Record<string, unknown>)
    } else if (companyIds?.length) {
      companies = await prisma.company.findMany({ where: { id: { in: companyIds } } }) as unknown as Array<Record<string, unknown>>
    } else {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
    }

    // Check export limit
    const limitErr = await checkExportLimit(session.id, session.plan || 'starter', companies.length);
    if (limitErr) {
      return NextResponse.json({ error: limitErr }, { status: 403 });
    }

    const csv = buildCsv(companies)

    prisma.exportLog.create({
      data: { userId: session.id, type: type || 'search', count: companies.length },
    }).catch(() => {})

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="obx-leads-export-${Date.now()}.csv"`,
      },
    })
  } catch (e) {
    console.error('Export POST error:', e)
    return NextResponse.json({ error: 'Error en la exportación' }, { status: 500 })
  }
}
