'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  district: string;
  province: string;
  profileImage?: string;
  customerId?: string;
  _id?: string;
}

export function useCustomerAuth() {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkCustomerAuth = () => {
      try {
        // Check new JWT-based authentication system first
        const customerToken = localStorage.getItem('customerToken');
        const customerData = localStorage.getItem('customerData');
        
        if (customerToken && customerData) {
          const parsedData = JSON.parse(customerData);
          setCustomer(parsedData);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
        
        // Fallback to old authentication system
        const oldCustomerData = localStorage.getItem('customer');
        if (oldCustomerData) {
          const parsedData = JSON.parse(oldCustomerData);
          setCustomer(parsedData);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
        
        // No authentication found
        setIsAuthenticated(false);
        setCustomer(null);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking customer authentication:', error);
        setIsAuthenticated(false);
        setCustomer(null);
        setIsLoading(false);
      }
    };

    checkCustomerAuth();
  }, []);

  const redirectToLogin = () => {
    router.push('/login');
  };

  return {
    customer,
    isLoading,
    isAuthenticated,
    redirectToLogin
  };
}
