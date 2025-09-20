import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
	try {
		const { name, email, phone, password } = await request.json();

		// Validate required fields
		if (!name || !email || !phone || !password) {
			return NextResponse.json(
				{ message: 'All fields are required' },
				{ status: 400 }
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ message: 'Invalid email format' },
				{ status: 400 }
			);
		}

		// Validate password strength
		if (password.length < 8) {
			return NextResponse.json(
				{ message: 'Password must be at least 8 characters long' },
				{ status: 400 }
			);
		}

		// Validate phone number (basic validation for Sri Lankan numbers)
		const phoneRegex = /^(\+94|94|0)[0-9]{9}$/;
		if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
			return NextResponse.json(
				{ message: 'Invalid phone number format' },
				{ status: 400 }
			);
		}

		// Connect to database
		const client = await connectToDatabase();
		const db = getDatabase(client);

		// Check if admin already exists
		const existingAdmin = await db.collection('admins').findOne({
			$or: [
				{ email: email.toLowerCase() },
				{ phone: phone.replace(/\s+/g, '') }
			]
		});

		if (existingAdmin) {
			return NextResponse.json(
				{ message: 'An admin with this email or phone number already exists' },
				{ status: 409 }
			);
		}

		// Hash password
		const saltRounds = 12;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Create admin document
		const adminData = {
			_id: new ObjectId(),
			name: name.trim(),
			email: email.toLowerCase().trim(),
			phone: phone.replace(/\s+/g, ''),
			password: hashedPassword,
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
			lastLogin: null,
			profileImage: null,
			department: 'Administration'
		};

		// Insert admin into database
		const result = await db.collection('admins').insertOne(adminData);

		if (!result.acknowledged) {
			return NextResponse.json(
				{ message: 'Failed to create admin account' },
				{ status: 500 }
			);
		}

		// Remove password from response
		const { password: _, ...adminResponse } = adminData;

		return NextResponse.json({
			message: 'Admin account created successfully',
			admin: {
				...adminResponse,
				_id: adminData._id.toString()
			}
		}, { status: 201 });

	} catch (error) {
		console.error('Signup error:', error);
		return NextResponse.json(
			{ message: 'Internal server error' },
			{ status: 500 }
		);
	}
}
