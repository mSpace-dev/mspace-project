'use client';

import { useState, useEffect } from 'react';
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
  Calendar
} from 'lucide-react';
import CustomerUserProfile from "../../components/CustomerUserProfile";
import { checkAuthAndLogout, CustomerData } from "../../lib/clientAuth";

interface Product {
  _id: string;
  name: string;
  category: string;
  variety?: string;
  description?: string;
  pricePerKg: number;
  availableQuantity: number;
  unit: string;
  harvestDate?: string;
  expiryDate?: string;
  quality: 'premium' | 'standard' | 'organic';
  location: {
    district: string;
    province: string;
    address: string;
  };
  images: string[];
  status: string;
  sellerId: {
    _id: string;
    name: string;
    businessName: string;
    district: string;
    province: string;
    isVerified: boolean;
  };
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
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
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    checkAuth();
  }, [filters, currentPage]);

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

  const checkAuth = () => {
    try {
      const { isAuthenticated, customerData } = checkAuthAndLogout();
      setCustomer(isAuthenticated ? customerData : null);
    } catch (error) {
      console.error('Auth check failed:', error);
      setCustomer(null);
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
      alert('Please log in to add items to your cart.');
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
        alert('Product added to cart successfully!');
      } else {
        alert('Failed to add product to cart.');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add product to cart.');
    }
  };

  const toggleWishlist = (productId: string) => {
    if (!customer) {
      alert('Please log in to add items to your wishlist.');
      return;
    }

    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      vegetables: '🥬',
      fruits: '🍎',
      grains: '🌾',
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigateToHome = () => {
    window.location.href = '/home';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer" onClick={navigateToHome}>
              <h1 className="text-2xl font-bold text-green-700 hover:text-green-600 transition-colors">AgriLink</h1>
              <span className="ml-2 text-sm text-gray-500">Sri Lanka</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/about" className="text-gray-700 hover:text-green-600 transition-colors">About</a>
              <a href="/products" className="text-green-600 font-semibold">Products</a>
              <a href="/prices" className="text-gray-700 hover:text-green-600 transition-colors">Market Prices</a>
              <a href="/our-team" className="text-gray-700 hover:text-green-600 transition-colors">Our Team</a>
              <a href="/partners" className="text-gray-700 hover:text-green-600 transition-colors">Partners</a>
              <a href="/contact" className="text-gray-700 hover:text-green-600 transition-colors">Contact</a>
              {customer ? (
                <div className="flex items-center space-x-4">
                  <a href="/customer/cart" className="relative p-2 text-gray-700 hover:text-green-600 transition-colors">
                    <ShoppingCart className="h-6 w-6" />
                  </a>
                  <CustomerUserProfile 
                    isLoggedIn={true} 
                    userRole="customer"
                    userName={customer.name || 'Customer'}
                    userEmail={customer.email || ''}
                  />
                </div>
              ) : (
                <a href="/login" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                  Login
                </a>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-700 hover:text-green-600 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <a href="/about" className="text-gray-700 hover:text-green-600 transition-colors">About</a>
                <a href="/products" className="text-green-600 font-semibold">Products</a>
                <a href="/prices" className="text-gray-700 hover:text-green-600 transition-colors">Market Prices</a>
                <a href="/our-team" className="text-gray-700 hover:text-green-600 transition-colors">Our Team</a>
                <a href="/partners" className="text-gray-700 hover:text-green-600 transition-colors">Partners</a>
                <a href="/contact" className="text-gray-700 hover:text-green-600 transition-colors">Contact</a>
                <div className="pt-2">
                  {customer ? (
                    <div className="flex flex-col space-y-3">
                      <a href="/customer/cart" className="flex items-center text-gray-700 hover:text-green-600 transition-colors">
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Shopping Cart
                      </a>
                      <CustomerUserProfile 
                        isLoggedIn={true} 
                        userRole="customer"
                        userName={customer.name || 'Customer'}
                        userEmail={customer.email || ''}
                      />
                    </div>
                  ) : (
                    <a href="/login" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-center block">
                      Login
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

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
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
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
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Categories</option>
                  {filterOptions.categories.map(category => (
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                }`}
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

                  {/* Quality Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getQualityBadgeColor(product.quality)}`}>
                      {product.quality}
                    </span>
                  </div>
                </div>

                {/* Product Details */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                    {product.sellerId.isVerified && (
                      <div className="flex items-center text-green-600">
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    )}
                  </div>

                  {product.variety && (
                    <p className="text-sm text-gray-600 mb-2">{product.variety}</p>
                  )}

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <User className="h-4 w-4 mr-1" />
                    <span>{product.sellerId.businessName || product.sellerId.name}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{product.location.district}, {product.location.province}</span>
                  </div>

                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(product.pricePerKg)}
                      </span>
                      <span className="text-sm text-gray-600 ml-1">per {product.unit}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Available</div>
                      <div className="font-medium">{product.availableQuantity} {product.unit}</div>
                    </div>
                  </div>

                  {/* Harvest Date */}
                  {product.harvestDate && (
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Harvested: {new Date(product.harvestDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.availableQuantity === 0 || !customer}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>
                        {product.availableQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </span>
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
