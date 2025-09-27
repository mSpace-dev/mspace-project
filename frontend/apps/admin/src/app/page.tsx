'use client'

import { useAuth } from '@/hooks/use-auth'
import { AdminDashboard } from '@/components/admin/dashboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function AdminPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}

