import jwt from 'jsonwebtoken';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JWTPayload {
  adminId: string;
  email: string;
  role: string;
  permissions: string[];
}

/**
 * Generate JWT token for admin authentication
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(
    payload, 
    JWT_SECRET as string, 
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'agrilink-admin',
      audience: 'agrilink-app',
    }
  );
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string, {
      issuer: 'agrilink-admin',
      audience: 'agrilink-app',
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Create refresh token (longer expiration)
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(
    payload, 
    JWT_SECRET as string, 
    {
      expiresIn: '7d', // 7 days for refresh token
      issuer: 'agrilink-admin',
      audience: 'agrilink-refresh',
    }
  );
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string, {
      issuer: 'agrilink-admin',
      audience: 'agrilink-refresh',
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}
