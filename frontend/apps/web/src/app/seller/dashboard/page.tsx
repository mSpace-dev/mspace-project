'use client'

import { useAuth } from '@/hooks/use-auth'
import { SellerDashboard } from '@/components/seller/dashboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function SellerDashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Please sign in</h1>
          <p className="mt-2 text-gray-600">You need to be signed in to access this page.</p>
        </div>
      </div>
    )
  }

  return <SellerDashboard />
}

