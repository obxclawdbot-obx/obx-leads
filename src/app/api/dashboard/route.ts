import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const userId = (session.user as { id?: string }).id
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalCompanies,
    searchesThisMonth,
    exportsThisMonth,
    exportedRecords,
    listsCount,
    savedSearches,
    recentActivity,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.activityLog.count({ where: { userId, action: 'search', createdAt: { gte: monthStart } } }),
    prisma.exportLog.count({ where: { userId, createdAt: { gte: monthStart } } }),
    prisma.exportLog.aggregate({ where: { userId, createdAt: { gte: monthStart } }, _sum: { count: true } }),
    prisma.list.count({ where: { userId } }),
    prisma.savedSearch.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.activityLog.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ])

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } })

  return NextResponse.json({
    plan: user?.plan || 'starter',
    totalCompanies,
    searchesThisMonth,
    exportsThisMonth,
    exportedRecords: exportedRecords._sum.count || 0,
    listsCount,
    savedSearches,
    recentActivity,
  })
}
