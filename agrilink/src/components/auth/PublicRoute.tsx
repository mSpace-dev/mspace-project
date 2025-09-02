'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/clientAuth';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Allow access to signup page even for authenticated users
    if (pathname === '/signup') {
      setIsLoading(false);
      return;
    }

    // Check which type of user is logged in using correct keys
    const admin = localStorage.getItem('admin');
    const seller = localStorage.getItem('seller');
    const customerToken = localStorage.getItem('customerToken');
    const customerData = localStorage.getItem('customerData');
    const customerOld = localStorage.getItem('customer'); // Fallback for old system
    
    // Redirect authenticated users to their appropriate dashboard
    if (admin) {
      router.push('/admin');
      return;
    } else if (seller) {
      router.push('/seller/dashboard');
      return;
    } else if (customerToken && customerData) {
      // Modern JWT-based customer authentication
      if (isAuthenticated()) {
        router.push('/customer/dashboard');
        return;
      }
    } else if (customerOld) {
      // Fallback for old customer authentication system
      router.push('/customer/dashboard');
      return;
    }
    
    setIsLoading(false);
  }, [router, pathname]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PublicRoute;
