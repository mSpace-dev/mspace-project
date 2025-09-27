'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Users', href: '/admin/users', icon: '👥' },
  { name: 'Products', href: '/admin/products', icon: '📦' },
  { name: 'Orders', href: '/admin/orders', icon: '📋' },
  { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
  { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
]

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-white">AgriLink Admin</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                {!isCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-gray-400">admin@agrilink.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

