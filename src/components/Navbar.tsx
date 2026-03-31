'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) return null

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/search', label: 'Buscar', icon: '🔍' },
    { href: '/lists', label: 'Listas', icon: '📋' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">OBX</span>
              <span className="text-lg font-semibold text-gray-700">Leads</span>
            </Link>
            <div className="hidden md:flex space-x-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">{session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
