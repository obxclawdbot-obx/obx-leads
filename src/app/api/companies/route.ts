import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query') || searchParams.get('q') || ''
  const provincia = searchParams.get('provincia') || ''
  const ccaa = searchParams.get('ccaa') || ''
  const cnae = searchParams.get('cnae') || searchParams.get('cnaeCode') || ''
  const minEmployees = searchParams.get('minEmployees') || ''
  const maxEmployees = searchParams.get('maxEmployees') || ''
  const minRevenue = searchParams.get('minRevenue') || ''
  const maxRevenue = searchParams.get('maxRevenue') || ''
  const minYear = searchParams.get('minYear') || ''
  const maxYear = searchParams.get('maxYear') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100)
  const skip = (page - 1) * limit

  // Build AND conditions
  const andConditions: Record<string, unknown>[] = []

  if (query) {
    andConditions.push({
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { cif: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
      ]
    })
  }
  if (provincia) andConditions.push({ provincia: { contains: provincia, mode: 'insensitive' } })
  if (ccaa) andConditions.push({ ccaa: { contains: ccaa, mode: 'insensitive' } })
  if (cnae) {
    andConditions.push({
      OR: [
        { cnaeDescription: { contains: cnae, mode: 'insensitive' } },
        { cnaeCode: { contains: cnae, mode: 'insensitive' } },
      ]
    })
  }
  if (minEmployees || maxEmployees) {
    const emp: Record<string, number> = {}
    if (minEmployees) emp.gte = parseInt(minEmployees)
    if (maxEmployees) emp.lte = parseInt(maxEmployees)
    andConditions.push({ employees: emp })
  }
  if (minRevenue || maxRevenue) {
    const rev: Record<string, number> = {}
    if (minRevenue) rev.gte = parseFloat(minRevenue)
    if (maxRevenue) rev.lte = parseFloat(maxRevenue)
    andConditions.push({ revenue: rev })
  }
  if (minYear || maxYear) {
    const yr: Record<string, number> = {}
    if (minYear) yr.gte = parseInt(minYear)
    if (maxYear) yr.lte = parseInt(maxYear)
    andConditions.push({ foundedYear: yr })
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {}

  try {
    const [companies, total] = await Promise.all([
      prisma.company.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.company.count({ where }),
    ])

    // Log activity (fire and forget)
    if (session.id) {
      prisma.activityLog.create({
        data: { userId: session.id, action: 'search', metadata: JSON.stringify({ query, provincia, ccaa, cnae }) },
      }).catch(() => {})
    }

    return NextResponse.json({ companies, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (e) {
    console.error('Companies search error:', e)
    return NextResponse.json({ error: 'Error en la búsqueda' }, { status: 500 })
  }
}
