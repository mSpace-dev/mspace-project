'use client'

import { ReactNode } from 'react'

interface AdminProvidersProps {
  children: ReactNode
}

export function AdminProviders({ children }: AdminProvidersProps) {
  return (
    <div>
      {children}
    </div>
  )
}

