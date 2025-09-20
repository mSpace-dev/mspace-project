import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { connectToDatabase, getDatabase } from '@/lib/database';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

declare module 'next-auth' {
  interface User {
    accessToken?: string;
    refreshToken?: string;
    adminData?: Record<string, unknown>;
  }
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    adminData?: Record<string, unknown>;
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
  async signIn({ user, profile }) {
      try {
        const client = await connectToDatabase();
        const db = getDatabase(client);

        // Check if admin exists with this email
        let admin = await db.collection('admins').findOne({
          email: user.email?.toLowerCase()
        });

        if (!admin) {
          // Create new admin account for Google sign-in
          const adminData = {
            _id: new ObjectId(),
            name: user.name,
            email: user.email?.toLowerCase(),
            phone: null,
            password: null, // No password for Google accounts
            role: 'admin',
            permissions: [
              'manage_users',
              'manage_products',
              'manage_orders',
              'view_analytics',
              'manage_content',
              'send_notifications'
            ],
            isActive: true,
            createdAt: new Date(),
            lastLogin: new Date(),
            profileImage: user.image,
            department: 'Administration',
            authProvider: 'google',
            googleId: profile?.sub
          };

          await db.collection('admins').insertOne(adminData);
          admin = adminData;
        } else {
          // Update last login for existing admin
          await db.collection('admins').updateOne(
            { _id: admin._id },
            {
              $set: {
                lastLogin: new Date(),
                profileImage: user.image,
                googleId: profile?.sub
              }
            }
          );
        }

        // Generate tokens
        const accessToken = jwt.sign(
          {
            adminId: admin._id,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions || []
          },
          JWT_SECRET,
          { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
          { adminId: admin._id },
          JWT_REFRESH_SECRET,
          { expiresIn: '7d' }
        );

        // Store tokens in session
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        user.adminData = {
          ...admin,
          _id: admin._id.toString()
        };

        return true;
      } catch (error) {
        console.error('Google sign-in error:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.adminData = user.adminData;
      }
      return token;
    },
    async session({ session, token }) {
  session.accessToken = token.accessToken as string;
  session.refreshToken = token.refreshToken as string;
  session.adminData = token.adminData as Record<string, unknown>;
  return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
