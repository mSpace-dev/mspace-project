"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Root() {
  const router = useRouter();

  useEffect(() => {
    // Client-side redirect to home page
    router.replace('/home');
  }, [router]);

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-green-600 font-medium">Loading AgriLink...</p>
      </div>
    </div>
  );
}
