import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Product from '@/lib/models/Product';
import Seller from '@/lib/models/Seller';

// GET - Fetch all available products for public viewing
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const district = searchParams.get('district');
    const province = searchParams.get('province');
    const quality = searchParams.get('quality');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {
      status: 'available',
      isActive: true,
      availableQuantity: { $gt: 0 }
    };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { variety: { $regex: search, $options: 'i' } }
      ];
    }

    if (district) {
      filter['location.district'] = district;
    }

    if (province) {
      filter['location.province'] = province;
    }

    if (quality && quality !== 'all') {
      filter.quality = quality;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Fetch products with seller information
    const products = await Product.find(filter)
      .populate('sellerId', 'name businessName district province isVerified')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get available filters data
    const categories = await Product.distinct('category', { status: 'available', isActive: true });
    const districts = await Product.distinct('location.district', { status: 'available', isActive: true });
    const provinces = await Product.distinct('location.province', { status: 'available', isActive: true });
    const qualities = await Product.distinct('quality', { status: 'available', isActive: true });

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filters: {
          categories: categories.sort(),
          districts: districts.sort(),
          provinces: provinces.sort(),
          qualities: qualities.sort()
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch products' 
      },
      { status: 500 }
    );
  }
}
