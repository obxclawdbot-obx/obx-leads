import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'


export async function GET(req: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''
  const provincia = searchParams.get('provincia') || ''
  const ccaa = searchParams.get('ccaa') || ''
  const cnae = searchParams.get('cnae') || ''
  const minEmployees = searchParams.get('minEmployees') || ''
  const maxEmployees = searchParams.get('maxEmployees') || ''
  const minRevenue = searchParams.get('minRevenue') || ''
  const maxRevenue = searchParams.get('maxRevenue') || ''
  const minYear = searchParams.get('minYear') || ''
  const maxYear = searchParams.get('maxYear') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}

  if (query) {
    where.OR = [
      { name: { contains: query } },
      { cif: { contains: query } },
      { city: { contains: query } },
    ]
  }
  if (provincia) where.provincia = { contains: provincia }
  if (ccaa) where.ccaa = { contains: ccaa }
  if (cnae) where.cnaeCode = { contains: cnae }
  if (minEmployees) where.employees = { ...where.employees, gte: parseInt(minEmployees) }
  if (maxEmployees) where.employees = { ...where.employees, lte: parseInt(maxEmployees) }
  if (minRevenue) where.revenue = { ...where.revenue, gte: parseFloat(minRevenue) }
  if (maxRevenue) where.revenue = { ...where.revenue, lte: parseFloat(maxRevenue) }
  if (minYear) where.foundedYear = { ...where.foundedYear, gte: parseInt(minYear) }
  if (maxYear) where.foundedYear = { ...where.foundedYear, lte: parseInt(maxYear) }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
    prisma.company.count({ where }),
  ])

  // Log activity
  const userId = (session as { id?: string }).id
  if (userId) {
    await prisma.activityLog.create({
      data: { userId, action: 'search', metadata: JSON.stringify({ query, provincia, ccaa, cnae }) },
    })
  }

  return NextResponse.json({ companies, total, page, limit, pages: Math.ceil(total / limit) })
}
