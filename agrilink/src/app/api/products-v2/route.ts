import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import ProductCatalog from '@/lib/models/ProductCatalog';
import SellerProduct from '@/lib/models/SellerProduct';
import Seller from '@/lib/models/Seller';

// GET - Fetch aggregated products with seller details
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

    // Build filter for product catalog
    const catalogFilter: any = { isActive: true };

    if (category && category !== 'all') {
      catalogFilter.category = category;
    }

    if (search) {
      catalogFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build seller filter for location-based filtering
    let sellerFilter: any = {};
    if (district || province) {
      if (district) sellerFilter.district = district;
      if (province) sellerFilter.province = province;
    }

    // Get sellers matching location filter
    let sellerIds: string[] = [];
    if (Object.keys(sellerFilter).length > 0) {
      const sellers = await Seller.find(sellerFilter).select('_id');
      sellerIds = sellers.map(s => s._id.toString());
    }

    // Build seller product filter
    const sellerProductFilter: any = { isActive: true };
    if (quality && quality !== 'all') {
      sellerProductFilter.quality = quality;
    }
    if (sellerIds.length > 0) {
      sellerProductFilter.sellerId = { $in: sellerIds };
    }

    // Aggregation pipeline to get products with seller details
    const pipeline = [
      // Match active product catalog items
      { $match: catalogFilter },
      
      // Lookup seller products
      {
        $lookup: {
          from: 'sellerproducts',
          localField: '_id',
          foreignField: 'productCatalogId',
          as: 'sellerProducts',
          pipeline: [
            { $match: sellerProductFilter },
            {
              $lookup: {
                from: 'sellers',
                localField: 'sellerId',
                foreignField: '_id',
                as: 'seller'
              }
            },
            { $unwind: '$seller' }
          ]
        }
      },
      
      // Filter out products with no matching seller products
      { $match: { 'sellerProducts.0': { $exists: true } } },
      
      // Add computed fields
      {
        $addFields: {
          totalAvailableQuantity: { $sum: '$sellerProducts.availableQuantity' },
          averagePrice: { $avg: '$sellerProducts.pricePerKg' },
          sellerCount: { $size: '$sellerProducts' },
          qualities: { $setUnion: '$sellerProducts.quality' }
        }
      },
      
      // Sort
      { $sort: { [sortBy]: sortOrder === 'asc' ? 1 as const : -1 as const } },
      
      // Pagination
      { $skip: skip },
      { $limit: limit }
    ];

    const products = await ProductCatalog.aggregate(pipeline);

    // Get total count
    const countPipeline = [
      { $match: catalogFilter },
      {
        $lookup: {
          from: 'sellerproducts',
          localField: '_id',
          foreignField: 'productCatalogId',
          as: 'sellerProducts',
          pipeline: [{ $match: sellerProductFilter }]
        }
      },
      { $match: { 'sellerProducts.0': { $exists: true } } },
      { $count: 'total' }
    ];

    const countResult = await ProductCatalog.aggregate(countPipeline);
    const totalProducts = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalProducts / limit);

    // Get filter options
    const categories = await ProductCatalog.distinct('category', { isActive: true });
    
    const allDistricts = [
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
      'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
      'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
      'Moneragala', 'Ratnapura', 'Kegalle'
    ];
    
    const allProvinces = [
      'Western', 'Central', 'Southern', 'Northern', 'Eastern', 
      'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
    ];
    
    const qualities = await SellerProduct.distinct('quality', { isActive: true });

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
