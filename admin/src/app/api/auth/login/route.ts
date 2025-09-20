import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return NextResponse.json(
				{ message: 'Email and password are required' },
				{ status: 400 }
			);
		}

		// Connect to database
		const client = await connectToDatabase();
		const db = getDatabase(client);

		// Find admin by email
		const admin = await db.collection('admins').findOne({ email: email.toLowerCase() });

		if (!admin) {
			return NextResponse.json(
				{ message: 'Invalid email or password' },
				{ status: 401 }
			);
		}

		// Check if admin is active
		if (!admin.isActive) {
			return NextResponse.json(
				{ message: 'Account is deactivated. Please contact administrator.' },
				{ status: 401 }
			);
		}

		// Verify password
		const isPasswordValid = await bcrypt.compare(password, admin.password);

		if (!isPasswordValid) {
			return NextResponse.json(
				{ message: 'Invalid email or password' },
				{ status: 401 }
			);
		}

		// Generate access token
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

		// Generate refresh token
		const refreshToken = jwt.sign(
			{ adminId: admin._id },
			JWT_REFRESH_SECRET,
			{ expiresIn: '7d' }
		);

		// Update last login
		await db.collection('admins').updateOne(
			{ _id: admin._id },
			{
				$set: {
					lastLogin: new Date(),
					refreshToken: refreshToken
				}
			}
		);

		// Remove password from response
		const { password: _, refreshToken: __, ...adminResponse } = admin;

		return NextResponse.json({
			message: 'Login successful',
			admin: {
				...adminResponse,
				_id: admin._id.toString()
			},
			accessToken,
			refreshToken
		});

	} catch (error) {
		console.error('Login error:', error);
		return NextResponse.json(
			{ message: 'Internal server error' },
			{ status: 500 }
		);
	}
}
