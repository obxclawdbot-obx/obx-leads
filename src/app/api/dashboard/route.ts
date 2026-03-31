// @ts-nocheck
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const userId = session.id
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalCompanies,
    totalLists,
    totalExports,
    recentActivity,
    allCompanies,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.list.count({ where: { userId } }),
    prisma.exportLog.count({ where: { userId } }),
    prisma.activityLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.company.findMany({ select: { provincia: true, cnaeDescription: true } }),
  ])

  // Empresas por provincia
  const provinciaMap: Record<string, number> = {}
  allCompanies.forEach((c: any) => {
    const p = c.provincia || 'Sin provincia'
    provinciaMap[p] = (provinciaMap[p] || 0) + 1
  })
  const empresasPorProvincia = Object.entries(provinciaMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // Top sectores
  const sectorMap: Record<string, number> = {}
  allCompanies.forEach((c: any) => {
    const s = c.cnaeDescription || 'Sin clasificar'
    sectorMap[s] = (sectorMap[s] || 0) + 1
  })
  const topSectores = Object.entries(sectorMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return NextResponse.json({
    totalCompanies,
    totalLists,
    totalExports,
    recentActivity,
    empresasPorProvincia,
    topSectores,
  })
}
