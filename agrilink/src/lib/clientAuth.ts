/**
 * Client-side authentication utilities
 * This file handles authentication logic that runs in the browser
 */

export interface CustomerData {
  customerId: string;
  name: string;
  email: string;
  phone?: string;
  district?: string;
  province?: string;
}

// Custom event types for authentication state changes
export const AUTH_EVENTS = {
  LOGIN: 'agrilink:auth:login',
  LOGOUT: 'agrilink:auth:logout',
  TOKEN_EXPIRED: 'agrilink:auth:tokenExpired'
} as const;

/**
 * Dispatch authentication event to notify all components
 */
function dispatchAuthEvent(eventType: string, data?: any) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent(eventType, { detail: data });
    window.dispatchEvent(event);
  }
}

/**
 * Check if token is expired (client-side)
 * This decodes the JWT without verifying the signature
 */
export function isTokenExpiredClient(token: string): boolean {
  try {
    // Decode JWT payload (without verification since we don't have the secret client-side)
    const base64Url = token.split('.')[1];
    if (!base64Url) return true;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}

/**
 * Get customer data from localStorage
 */
export function getCustomerData(): CustomerData | null {
  try {
    const customerData = localStorage.getItem('customerData');
    return customerData ? JSON.parse(customerData) : null;
  } catch (error) {
    console.error('Error getting customer data:', error);
    return null;
  }
}

/**
 * Get customer token from localStorage
 */
export function getCustomerToken(): string | null {
  try {
    return localStorage.getItem('customerToken');
  } catch (error) {
    console.error('Error getting customer token:', error);
    return null;
  }
}

/**
 * Check if user is authenticated with valid token
 */
export function isAuthenticated(): boolean {
  const token = getCustomerToken();
  if (!token) return false;
  
  return !isTokenExpiredClient(token);
}

/**
 * Logout user by clearing localStorage and redirecting
 */
export function logoutUser(redirectTo: string = '/login'): void {
  try {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    
    // Dispatch logout event to notify all components
    dispatchAuthEvent(AUTH_EVENTS.LOGOUT);
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

/**
 * Set customer authentication data
 */
export function setCustomerAuth(token: string, customerData: CustomerData): void {
  try {
    localStorage.setItem('customerToken', token);
    localStorage.setItem('customerData', JSON.stringify(customerData));
    
    // Dispatch login event to notify all components
    dispatchAuthEvent(AUTH_EVENTS.LOGIN, { customerData });
  } catch (error) {
    console.error('Error setting customer auth:', error);
  }
}

/**
 * Check authentication and automatically logout if token is expired
 */
export function checkAuthAndLogout(): { isAuthenticated: boolean; customerData: CustomerData | null } {
  const token = getCustomerToken();
  const customerData = getCustomerData();
  
  if (!token || !customerData) {
    return { isAuthenticated: false, customerData: null };
  }
  
  if (isTokenExpiredClient(token)) {
    // Token is expired, logout user and dispatch event
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    dispatchAuthEvent(AUTH_EVENTS.TOKEN_EXPIRED);
    return { isAuthenticated: false, customerData: null };
  }
  
  return { isAuthenticated: true, customerData };
}

/**
 * Add event listener for authentication events
 */
export function addAuthEventListener(callback: (eventType: string, data?: any) => void) {
  if (typeof window === 'undefined') return () => {};

  const handleAuthEvent = (event: CustomEvent) => {
    callback(event.type, event.detail);
  };

  // Add listeners for all auth events
  Object.values(AUTH_EVENTS).forEach(eventType => {
    window.addEventListener(eventType, handleAuthEvent as EventListener);
  });

  // Return cleanup function
  return () => {
    Object.values(AUTH_EVENTS).forEach(eventType => {
      window.removeEventListener(eventType, handleAuthEvent as EventListener);
    });
  };
}
