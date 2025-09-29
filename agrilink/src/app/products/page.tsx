'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ShoppingCart,
  Filter, 
  Search, 
  MapPin, 
  Star, 
  Heart,
  Grid3X3,
  List,
  ChevronDown,
  Package,
  User,
  Calendar,
  X,
  Phone,
  Mail
} from 'lucide-react';
import CustomerNavBar from "../../components/CustomerNavBar";
import { useCustomerAuth } from "../../hooks/useCustomerAuth";
import { useModal } from '../../components/ModalProvider';

interface SellerInfo {
  _id: string;
  sellerId?: {
    _id: string;
    name: string;
    businessName: string;
    district: string;
    province: string;
    isVerified: boolean;
  };
  pricePerKg: number;
  availableQuantity: number;
  location?: {
    district: string;
    province: string;
    address: string;
  };
  harvestDate?: string;
  expiryDate?: string;
  quality: 'premium' | 'standard' | 'organic';
  status: string;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  variety?: string;
  description?: string;
  images: string[];
  totalAvailableQuantity: number;
  averagePrice: number;
  unit: string;
  qualities: string[];
  sellers: SellerInfo[];
  createdAt: string;
  updatedAt: string;
}

interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters: {
      categories: string[];
      districts: string[];
      provinces: string[];
      qualities: string[];
    };
  };
}

function ProductsPageInner() {
  const { customer, isLoading: authLoading, isAuthenticated } = useCustomerAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    district: '',
    province: '',
    quality: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    categories: [] as string[],
    districts: [] as string[],
    provinces: [] as string[],
    qualities: [] as string[]
  });

  // Ensure UI includes the new 'grain' category (singular) even if API returns 'grains' or omits it
  const computedCategories = Array.from(new Set([...(filterOptions.categories || []), 'grain']));
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const modal = useModal();

  useEffect(() => {
    fetchProducts();
  }, [filters, currentPage]);

  // Refresh products when component gains focus (e.g., returning from payment)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Page gained focus, refreshing products...');
      fetchProducts();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Check for order success parameter
  useEffect(() => {
    const orderSuccess = searchParams.get('orderSuccess');
    if (orderSuccess === 'true') {
      setShowSuccessMessage(true);
      // Remove the parameter from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('orderSuccess');
      window.history.replaceState({}, '', newUrl.toString());
      
      // Hide message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams]);

  // Initialize filters from URL query params (e.g., ?category=vegetables)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      // Normalize some category names (API may use singular 'grain')
      const normalized = categoryParam === 'grains' ? 'grain' : categoryParam;
      setFilters(prev => ({
        ...prev,
        category: normalized
      }));
      setCurrentPage(1);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...filters
      });

      // Remove empty filters
      Object.keys(filters).forEach(key => {
        if (!filters[key as keyof typeof filters] || filters[key as keyof typeof filters] === 'all') {
          params.delete(key);
        }
      });

      const response = await fetch(`/api/products?${params}`);
      const data: ProductsResponse = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setCurrentPage(data.data.pagination.currentPage);
        setTotalPages(data.data.pagination.totalPages);
        setTotalProducts(data.data.pagination.totalProducts);
        setFilterOptions(data.data.filters);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
    setCurrentPage(1);
  };

  const addToCart = async (product: Product) => {
    if (!customer) {
      await modal.alert('Please log in to add items to your cart.');
      return;
    }

    try {
      const response = await fetch('/api/customer/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1
        })
      });

        if (response.ok) {
        await modal.alert('Product added to cart successfully!');
      } else {
        await modal.alert('Failed to add product to cart.');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      await modal.alert('Failed to add product to cart.');
    }
  };

  const toggleWishlist = (productId: string) => {
    if (!customer) {
      modal.alert('Please log in to add items to your wishlist.');
      return;
    }

    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setShowModal(false);
  };

  const addToCartFromSeller = (sellerId: string, productId: string, productName: string, sellerName: string, price: number, unit: string) => {
    console.log('addToCartFromSeller called with:', { sellerId, productId, productName, sellerName, price, unit });
    
    if (!customer) {
      modal.alert('Please log in to purchase items.');
      return;
    }

    // Redirect to payment page with product details
    const params = new URLSearchParams({
      productId,
      sellerId,
      productName,
      sellerName,
      price: price.toString(),
      unit
    });

    console.log('Navigating to:', `/payment?${params.toString()}`);
    router.push(`/payment?${params.toString()}`);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      vegetables: '🥬',
      fruits: '🍎',
      grain: '🌾', // singular form
      spices: '🌶️',
      herbs: '🌿',
      dairy: '🥛',
      coconut: '🥥',
      other: '📦'
    };
    return icons[category] || '📦';
  };

  const getQualityBadgeColor = (quality: string) => {
    const colors: { [key: string]: string } = {
      premium: 'bg-purple-100 text-purple-800',
      organic: 'bg-green-100 text-green-800',
      standard: 'bg-blue-100 text-blue-800'
    };
    return colors[quality] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavBar customer={customer || undefined} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Fresh Agricultural Products</h1>
            <p className="text-xl mb-8">Discover quality products directly from Sri Lankan farmers</p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for products, varieties, or sellers..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-5 w-5 text-black" />
              <span className="text-black">Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform text-black ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Package className="h-4 w-4" />
              <span>{totalProducts} products found</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort Options */}
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="pricePerKg-asc">Price: Low to High</option>
              <option value="pricePerKg-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-white border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg transition-colors ${
                  viewMode === 'list' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                >
                  <option value="all">All Categories</option>
                  {computedCategories.map(category => (
                    <option key={category} value={category}>
                      {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quality Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
                <select
                  value={filters.quality}
                  onChange={(e) => handleFilterChange('quality', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                >
                  <option value="all">All Qualities</option>
                  {filterOptions.qualities.map(quality => (
                    <option key={quality} value={quality}>
                      {quality.charAt(0).toUpperCase() + quality.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <select
                  value={filters.district}
                  onChange={(e) => handleFilterChange('district', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                >
                  <option value="">All Districts</option>
                  {filterOptions.districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              {/* Province Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                <select
                  value={filters.province}
                  onChange={(e) => handleFilterChange('province', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
                >
                  <option value="">All Provinces</option>
                  {filterOptions.provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setFilters({
                    category: 'all',
                    search: '',
                    district: '',
                    province: '',
                    quality: 'all',
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                  });
                  setCurrentPage(1);
                }}
                className="text-sm text-green-600 hover:text-green-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-6'
          }`}>
            {products.map((product) => (
              <div
                key={product._id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'flex' : ''
                } ${product.totalAvailableQuantity === 0 ? 'opacity-75' : ''}`}
              >
                {/* Product Image */}
                <div className={`${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'w-full h-48'} bg-gray-100 relative`}>
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {getCategoryIcon(product.category)}
                    </div>
                  )}
                  
                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product._id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    <Heart 
                      className={`h-5 w-5 ${
                        wishlist.includes(product._id) ? 'text-red-500 fill-current' : 'text-gray-400'
                      }`} 
                    />
                  </button>

                  {/* Quality Badge - Show most common quality or first one */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getQualityBadgeColor(product.qualities[0] || 'standard')}`}>
                      {product.qualities[0] || 'standard'}
                      {product.qualities.length > 1 && ` +${product.qualities.length - 1}`}
                    </span>
                  </div>

                  {/* Out of Stock Badge */}
                  {product.totalAvailableQuantity === 0 && (
                    <div className="absolute top-2 right-12">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                    {/* Show verified badge if any seller is verified */}
                    {product.sellers.some((seller: SellerInfo) => seller.sellerId?.isVerified) && (
                      <div className="flex items-center text-green-600">
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <User className="h-4 w-4 mr-1" />
                    <span>{product.sellers.length} seller{product.sellers.length > 1 ? 's' : ''} available</span>
                  </div>

                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  )}

                  <div className="mb-3">
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(product.averagePrice)}
                      </span>
                      <span className="text-sm text-gray-600 ml-1">avg per {product.unit}</span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-gray-600">
                        Total Available: <span className="font-medium text-gray-900">{product.totalAvailableQuantity} {product.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openProductModal(product)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-black"
            >
              Previous
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-green-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-black"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {selectedProduct.images.length > 0 && (
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                  {selectedProduct.description && (
                    <p className="text-sm text-gray-600 mt-1">{selectedProduct.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Available from {selectedProduct.sellers.length} seller{selectedProduct.sellers.length > 1 ? 's' : ''}
                </h3>
                
                <div className="grid gap-4">
                  {selectedProduct.sellers.map((seller: SellerInfo, index: number) => (
                    <div
                      key={seller._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <User className="h-5 w-5 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900">
                              {seller.sellerId?.businessName || seller.sellerId?.name || 'Unknown Seller'}
                            </span>
                            {seller.sellerId?.isVerified && (
                              <Star className="h-4 w-4 text-green-600 fill-current ml-2" />
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            {/* Location */}
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{seller.location?.district || 'Unknown'}, {seller.location?.province || 'Unknown'}</span>
                            </div>

                            {/* Available Amount */}
                            <div className="flex items-center text-gray-600">
                              <Package className="h-4 w-4 mr-1" />
                              <span>
                                {seller.availableQuantity} {selectedProduct.unit} available
                                {seller.availableQuantity > 0 && seller.availableQuantity <= 5 && (
                                  <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                    Low Stock
                                  </span>
                                )}
                              </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center text-gray-600">
                              <span className="font-medium text-green-600">
                                {formatPrice(seller.pricePerKg)} per {selectedProduct.unit}
                              </span>
                            </div>

                            {/* Harvest Date */}
                            {seller.harvestDate && (
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Harvested: {new Date(seller.harvestDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          {/* Quality */}
                          <div className="mt-2">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getQualityBadgeColor(seller.quality)}`}>
                              {seller.quality}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-4 md:mt-0 md:ml-4">
                          {seller.availableQuantity > 0 ? (
                            <button
                              onClick={() => {
                                console.log('Buy Now clicked, seller data:', seller);
                                console.log('selectedProduct:', selectedProduct);
                                console.log('customer:', customer);
                                addToCartFromSeller(
                                  seller.sellerId?._id || '', 
                                  seller._id, 
                                  selectedProduct.name,
                                  seller.sellerId?.businessName || seller.sellerId?.name || 'Unknown Seller',
                                  seller.pricePerKg,
                                  selectedProduct.unit
                                );
                              }}
                              className="bg-green-700 hover:bg-green-800 disabled:bg-green-300 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              <span>Buy Now</span>
                            </button>
                          ) : (
                            <button
                              disabled
                              className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium cursor-not-allowed"
                            >
                              Out of Stock
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-green-600">Loading...</div>}>
      <ProductsPageInner/>
    </Suspense>
  );
}