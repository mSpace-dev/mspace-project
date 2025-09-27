'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if admin is already logged in
    const adminData = localStorage.getItem('admin');
    const accessToken = localStorage.getItem('adminAccessToken');

    if (adminData && accessToken) {
      // Admin is logged in, redirect to dashboard
      router.push('/');
    } else {
      // Admin is not logged in, redirect to login
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">AgriLink Admin</h2>
        <p className="text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}
