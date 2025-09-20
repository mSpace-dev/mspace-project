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
      isActive: true
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
    const allProducts = await Product.find(filter)
      .populate('sellerId', 'name businessName district province isVerified')
      .sort(sort)
      .lean();

    // Group products by name and aggregate data
    const productGroups = new Map();
    
    allProducts.forEach(product => {
      const key = product.name;
      if (!productGroups.has(key)) {
        productGroups.set(key, {
          _id: product._id, // Use first product's ID as representative
          name: product.name,
          category: product.category,
          variety: product.variety,
          description: product.description,
          images: product.images,
          totalAvailableQuantity: 0,
          averagePrice: 0,
          sellers: [],
          unit: product.unit,
          qualities: new Set(),
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        });
      }
      
      const group = productGroups.get(key);
      group.totalAvailableQuantity += product.availableQuantity;
      group.sellers.push({
        _id: product._id,
        sellerId: product.sellerId,
        pricePerKg: product.pricePerKg,
        availableQuantity: product.availableQuantity,
        location: product.location,
        harvestDate: product.harvestDate,
        expiryDate: product.expiryDate,
        quality: product.quality,
        status: product.status
      });
      group.qualities.add(product.quality);
    });

    // Calculate average prices and convert to array
    const groupedProducts = Array.from(productGroups.values()).map(group => {
      const totalPrice = group.sellers.reduce((sum: number, seller: any) => sum + seller.pricePerKg, 0);
      group.averagePrice = totalPrice / group.sellers.length;
      group.qualities = Array.from(group.qualities);
      return group;
    });

    // Apply pagination to grouped products
    const paginatedProducts = groupedProducts.slice(skip, skip + limit);
    const totalGroupedProducts = groupedProducts.length;
    const totalPages = Math.ceil(totalGroupedProducts / limit);

    // Get available filters data
    const categories = await Product.distinct('category', { isActive: true });
    
    // Get all Sri Lankan districts (predefined list to ensure all are available)
    const allDistricts = [
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
      'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
      'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
      'Moneragala', 'Ratnapura', 'Kegalle'
    ];
    
    // Get all Sri Lankan provinces (predefined list)
    const allProvinces = [
      'Western', 'Central', 'Southern', 'Northern', 'Eastern', 
      'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
    ];
    
    const qualities = await Product.distinct('quality', { isActive: true });

    return NextResponse.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts: totalGroupedProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filters: {
          categories: categories.sort(),
          districts: allDistricts.sort(),
          provinces: allProvinces.sort(),
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
