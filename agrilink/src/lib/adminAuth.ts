import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

/**
 * Middleware to authenticate admin requests using JWT
 */
export function authenticateAdmin(req: NextRequest): { isValid: boolean; admin?: any; error?: string } {
  try {
    const authHeader = req.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return {
        isValid: false,
        error: 'No authorization token provided'
      };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return {
        isValid: false,
        error: 'Invalid or expired token'
      };
    }

    return {
      isValid: true,
      admin: decoded
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Create authentication response for unauthorized requests
 */
export function createUnauthorizedResponse(error: string) {
  return NextResponse.json(
    { error, message: 'Authentication required' },
    { status: 401 }
  );
}

/**
 * Check if admin has specific permission
 */
export function hasPermission(admin: any, requiredPermission: string): boolean {
  if (!admin.permissions || !Array.isArray(admin.permissions)) {
    return false;
  }
  
  // Super admin has all permissions
  if (admin.role === 'super_admin') {
    return true;
  }
  
  return admin.permissions.includes(requiredPermission);
}

/**
 * Create forbidden response for insufficient permissions
 */
export function createForbiddenResponse(requiredPermission: string) {
  return NextResponse.json(
    { 
      error: 'Insufficient permissions', 
      message: `This action requires the '${requiredPermission}' permission`,
      requiredPermission 
    },
    { status: 403 }
  );
}
