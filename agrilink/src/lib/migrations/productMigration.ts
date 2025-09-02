import { dbConnect } from '@/lib/dbConnect';
import Product from '@/lib/models/Product'; // Your existing model
import ProductCatalog from '@/lib/models/ProductCatalog';
import SellerProduct from '@/lib/models/SellerProduct';

export async function migrateToNewStructure() {
  try {
    await dbConnect();

    console.log('Starting migration to new product structure...');

    // Get all existing products
    const existingProducts = await Product.find({ isActive: true })
      .populate('sellerId')
      .lean();

    console.log(`Found ${existingProducts.length} existing products`);

    // Group products by name to create catalog entries
    const productGroups = new Map();

    for (const product of existingProducts) {
      const key = product.name;
      
      if (!productGroups.has(key)) {
        productGroups.set(key, {
          name: product.name,
          category: product.category,
          description: product.description || '',
          images: product.images || [],
          unit: product.unit,
          sellers: []
        });
      }

      const group = productGroups.get(key);
      group.sellers.push({
        sellerId: product.sellerId._id,
        variety: product.variety || '',
        pricePerKg: product.pricePerKg,
        availableQuantity: product.availableQuantity,
        harvestDate: product.harvestDate,
        expiryDate: product.expiryDate,
        quality: product.quality,
        status: product.status,
        originalProductId: product._id
      });
    }

    console.log(`Created ${productGroups.size} product groups`);

    // Create ProductCatalog entries and SellerProduct entries
    let catalogCount = 0;
    let sellerProductCount = 0;

    for (const [productName, groupData] of productGroups) {
      // Calculate aggregated data
      const totalAvailableQuantity = groupData.sellers.reduce(
        (sum: number, seller: any) => sum + seller.availableQuantity, 0
      );
      const averagePrice = groupData.sellers.reduce(
        (sum: number, seller: any) => sum + seller.pricePerKg, 0
      ) / groupData.sellers.length;

      // Create ProductCatalog entry
      const catalog = await ProductCatalog.create({
        name: groupData.name,
        category: groupData.category,
        description: groupData.description,
        images: groupData.images,
        totalAvailableQuantity,
        averagePrice,
        unit: groupData.unit,
        sellerCount: groupData.sellers.length,
        isActive: true
      });

      catalogCount++;
      console.log(`Created catalog entry: ${catalog.name}`);

      // Create SellerProduct entries
      for (const sellerData of groupData.sellers) {
        await SellerProduct.create({
          productCatalogId: catalog._id,
          sellerId: sellerData.sellerId,
          variety: sellerData.variety,
          pricePerKg: sellerData.pricePerKg,
          availableQuantity: sellerData.availableQuantity,
          harvestDate: sellerData.harvestDate,
          expiryDate: sellerData.expiryDate,
          quality: sellerData.quality,
          status: sellerData.status,
          isActive: true
        });

        sellerProductCount++;
      }
    }

    console.log(`Migration completed successfully!`);
    console.log(`Created ${catalogCount} product catalog entries`);
    console.log(`Created ${sellerProductCount} seller product entries`);

    return {
      success: true,
      catalogCount,
      sellerProductCount
    };

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Helper function to update aggregated data
export async function updateProductCatalogAggregates(productCatalogId: string) {
  try {
    const sellerProducts = await SellerProduct.find({
      productCatalogId,
      isActive: true
    });

    if (sellerProducts.length === 0) {
      // No active seller products, mark catalog as inactive
      await ProductCatalog.findByIdAndUpdate(productCatalogId, {
        totalAvailableQuantity: 0,
        averagePrice: 0,
        sellerCount: 0,
        isActive: false
      });
      return;
    }

    const totalAvailableQuantity = sellerProducts.reduce(
      (sum, product) => sum + product.availableQuantity, 0
    );
    const averagePrice = sellerProducts.reduce(
      (sum, product) => sum + product.pricePerKg, 0
    ) / sellerProducts.length;

    await ProductCatalog.findByIdAndUpdate(productCatalogId, {
      totalAvailableQuantity,
      averagePrice,
      sellerCount: sellerProducts.length,
      isActive: true
    });

  } catch (error) {
    console.error('Failed to update catalog aggregates:', error);
    throw error;
  }
}
