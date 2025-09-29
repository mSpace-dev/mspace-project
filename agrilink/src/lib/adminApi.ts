/**
 * API utility for making authenticated requests with JWT tokens
 */

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

/**
 * Get stored access token
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminAccessToken');
}

/**
 * Get stored refresh token
 */
function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminRefreshToken');
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch('/api/admin/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('adminAccessToken', data.accessToken);
      return data.accessToken;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  return null;
}

/**
 * Make authenticated API request
 */
export async function makeAuthenticatedRequest(
  url: string, 
  options: ApiOptions = {}
): Promise<Response> {
  let accessToken = getAccessToken();

  const makeRequest = async (token: string | null) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  };

  // First attempt with current token
  let response = await makeRequest(accessToken);

  // If unauthorized, try to refresh token and retry
  if (response.status === 401 && accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await makeRequest(newToken);
    }
  }

  // If still unauthorized, clear tokens and redirect to login
  if (response.status === 401) {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    window.location.href = '/login';
  }

  return response;
}

/**
 * Admin API helper functions
 */
export const adminApi = {
  /**
   * Get admin profile
   */
  async getProfile() {
    return makeAuthenticatedRequest('/api/admin/profile');
  },

  /**
   * Update admin profile
   */
  async updateProfile(data: { name?: string; phone?: string }) {
    return makeAuthenticatedRequest('/api/admin/profile', {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * Create new admin (requires manage_admins permission)
   */
  async createAdmin(adminData: any) {
    return makeAuthenticatedRequest('/api/admin/create', {
      method: 'POST',
      body: adminData,
    });
  },

  /**
   * Generic authenticated request
   */
  async request(url: string, options: ApiOptions = {}) {
    return makeAuthenticatedRequest(url, options);
  },
};

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  const admin = localStorage.getItem('admin');
  return !!(token && admin);
}

/**
 * Get current admin data
 */
export function getCurrentAdmin(): any {
  const adminData = localStorage.getItem('admin');
  return adminData ? JSON.parse(adminData) : null;
}
