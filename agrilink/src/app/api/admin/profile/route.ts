import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, createUnauthorizedResponse, hasPermission, createForbiddenResponse } from '@/lib/adminAuth';
import { dbConnect } from '@/lib/dbConnect';
import Admin from '@/lib/models/Admin';

// Get admin profile (protected route)
export async function GET(req: NextRequest) {
  try {
    // Authenticate admin
    const auth = authenticateAdmin(req);
    if (!auth.isValid) {
      return createUnauthorizedResponse(auth.error || 'Authentication failed');
    }

    await dbConnect();

    // Get fresh admin data from database
    const admin = await Admin.findById(auth.admin!.adminId).select('-password');
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Admin profile retrieved successfully',
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
          permissions: admin.permissions,
          isActive: admin.isActive,
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get admin profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update admin profile (protected route)
export async function PUT(req: NextRequest) {
  try {
    // Authenticate admin
    const auth = authenticateAdmin(req);
    if (!auth.isValid) {
      return createUnauthorizedResponse(auth.error || 'Authentication failed');
    }

    // Check permissions (only super_admin or the admin themselves can update profile)
    if (auth.admin!.role !== 'super_admin' && !hasPermission(auth.admin!, 'manage_admins')) {
      return createForbiddenResponse('manage_admins');
    }

    await dbConnect();

    const { name, phone } = await req.json();

    // Update admin profile
    const admin = await Admin.findByIdAndUpdate(
      auth.admin!.adminId,
      {
        ...(name && { name }),
        ...(phone && { phone }),
        updatedAt: new Date(),
      },
      { new: true, select: '-password' }
    );

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Admin profile updated successfully',
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
          permissions: admin.permissions,
          isActive: admin.isActive,
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update admin profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
