'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, Eye, BarChart3 } from 'lucide-react';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';
import ProductEditModal from '../../components/ProductEditModal';
import EmailNotificationManager from '@/components/EmailNotificationManager';

interface Seller {
  _id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  district: string;
  province: string;
  address: string;
  licenseNumber?: string;
  isVerified: boolean;
  products: string[];
  createdAt: string;
}

interface Product {
  _id: string;
  sellerId: string;
  name: string;
  category: string;
  variety?: string;
  description?: string;
  pricePerKg: number;
  availableQuantity: number;
  unit: string;
  harvestDate?: string;
  expiryDate?: string;
  quality: string;
  location: {
    district: string;
    province: string;
    address: string;
  };
  images: string[];
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SellerDashboard() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const [productForm, setProductForm] = useState({
    name: '',
    category: 'vegetables',
    variety: '',
    description: '',
    pricePerKg: '',
    availableQuantity: '',
    unit: 'kg',
    harvestDate: '',
    expiryDate: '',
    quality: 'standard',
    location: {
      district: '',
      province: '',
      address: '',
    },
  });

  const categories = [
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'grains', label: 'Grains' },
    { value: 'spices', label: 'Spices' },
    { value: 'herbs', label: 'Herbs' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'coconut', label: 'Coconut Products' },
    { value: 'other', label: 'Other' },
  ];

  const qualities = [
    { value: 'premium', label: 'Premium' },
    { value: 'standard', label: 'Standard' },
    { value: 'organic', label: 'Organic' },
  ];

  const units = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'tons', label: 'Tons' },
    { value: 'pieces', label: 'Pieces' },
    { value: 'bundles', label: 'Bundles' },
  ];

  const districts = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle',
    'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle',
    'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Moneragala',
    'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
    'Trincomalee', 'Vavuniya'
  ];

  const provinces = [
    'Central', 'Eastern', 'Northern', 'North Central', 'North Western',
    'Sabaragamuwa', 'Southern', 'Uva', 'Western'
  ];

  useEffect(() => {
    // Check if seller is logged in
    const sellerData = localStorage.getItem('seller');
    if (!sellerData) {
      router.push('/seller');
      return;
    }

    const parsedSeller = JSON.parse(sellerData);
    setSeller(parsedSeller);
    
    // Set location from seller's data
    setProductForm(prev => ({
      ...prev,
      location: {
        district: parsedSeller.district,
        province: parsedSeller.province,
        address: parsedSeller.address,
      }
    }));

    // Fetch seller's products
    fetchProducts(parsedSeller._id);
  }, [router]);

  const fetchProducts = async (sellerId: string) => {
    try {
      const response = await fetch(`/api/seller/products?sellerId=${sellerId}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products);
      } else {
        setError('Failed to fetch products');
      }
    } catch (error) {
      setError('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setProductForm(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setProductForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seller) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/seller/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productForm,
          sellerId: seller._id,
          pricePerKg: Number(productForm.pricePerKg),
          availableQuantity: Number(productForm.availableQuantity),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Product added successfully!');
        setShowAddProduct(false);
        setProductForm({
          name: '',
          category: 'vegetables',
          variety: '',
          description: '',
          pricePerKg: '',
          availableQuantity: '',
          unit: 'kg',
          harvestDate: '',
          expiryDate: '',
          quality: 'standard',
          location: {
            district: seller.district,
            province: seller.province,
            address: seller.address,
          },
        });
        // Refresh products
        fetchProducts(seller._id);
      } else {
        setError(data.error || 'Failed to add product');
      }
    } catch (error) {
      setError('Error adding product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!seller || !confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/seller/products?productId=${productId}&sellerId=${seller._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Product deleted successfully!');
        fetchProducts(seller._id);
      } else {
        setError('Failed to delete product');
      }
    } catch (error) {
      setError('Error deleting product');
    }
  };

  const handleEditProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => 
      p._id === updatedProduct._id ? updatedProduct : p
    ));
    setSuccess('Product updated successfully!');
  };

  const handleDeleteFromModal = (productId: string) => {
    setProducts(prev => prev.filter(p => p._id !== productId));
    setSuccess('Product deleted successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('seller');
    router.push('/seller');
  };

  const navigateToHome = () => {
    router.push('/home');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalValue = () => {
    return products.reduce((total, product) => {
      return total + (product.pricePerKg * product.availableQuantity);
    }, 0).toFixed(2);
  };

  const getAvailableProducts = () => {
    return products.filter(product => product.status === 'available').length;
  };

  if (loading && !seller) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer" onClick={navigateToHome}>
              <h1 className="text-2xl font-bold text-blue-700 hover:text-blue-600 transition-colors">AgriLink</h1>
              <span className="ml-2 text-sm text-gray-500">Seller Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {seller.name}</span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Products
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Email Notifications
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📦</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Products</p>
                    <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">✅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Available Products</p>
                    <p className="text-2xl font-semibold text-gray-900">{getAvailableProducts()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Inventory Value</p>
                    <p className="text-2xl font-semibold text-gray-900">Rs. {calculateTotalValue()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Products</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {products.slice(0, 5).map((product) => (
                  <div key={product._id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category} • Rs. {product.pricePerKg}/kg</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
              <button
                onClick={() => setShowAddProduct(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Add New Product
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Category:</strong> {product.category}</p>
                      {product.variety && <p><strong>Variety:</strong> {product.variety}</p>}
                      <p><strong>Price:</strong> Rs. {product.pricePerKg}/kg</p>
                      <p><strong>Quantity:</strong> {product.availableQuantity} {product.unit}</p>
                      <p><strong>Quality:</strong> {product.quality}</p>
                      <p><strong>Location:</strong> {product.location.district}</p>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowEditProduct(true);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded flex items-center justify-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products added yet.</p>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                >
                  Add Your First Product
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard products={products} sellerId={seller?._id || ''} />
        )}

        {/* Email Notifications Tab */}
        {activeTab === 'notifications' && (
          <EmailNotificationManager />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Seller Profile</h2>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-gray-900">{seller.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{seller.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{seller.phone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Business Name</label>
                      <p className="text-gray-900">{seller.businessName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900">Business Type</label>
                      <p className="text-gray-900 capitalize">{seller.businessType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">License Number</label>
                      <p className="text-gray-900">{seller.licenseNumber || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-900">District</label>
                      <p className="text-gray-900">{seller.district}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Province</label>
                      <p className="text-gray-900">{seller.province}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-gray-900">{seller.address}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${seller.isVerified ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                    <span className="text-sm font-medium text-gray-900">
                      Account Status: {seller.isVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                  {!seller.isVerified && (
                    <p className="text-sm text-gray-600 mt-2">
                      Your account is pending verification. You can still add products, but they will be reviewed before going live.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Product</h3>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={productForm.name}
                      onChange={handleProductFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleProductFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variety
                    </label>
                    <input
                      type="text"
                      name="variety"
                      value={productForm.variety}
                      onChange={handleProductFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="e.g., Red Lady, Ambul"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quality *
                    </label>
                    <select
                      name="quality"
                      value={productForm.quality}
                      onChange={handleProductFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      {qualities.map(quality => (
                        <option key={quality.value} value={quality.value}>{quality.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Kg (Rs.) *
                    </label>
                    <input
                      type="number"
                      name="pricePerKg"
                      value={productForm.pricePerKg}
                      onChange={handleProductFormChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Enter price per kg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Available Quantity *
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        name="availableQuantity"
                        value={productForm.availableQuantity}
                        onChange={handleProductFormChange}
                        required
                        min="0"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Quantity"
                      />
                      <select
                        name="unit"
                        value={productForm.unit}
                        onChange={handleProductFormChange}
                        className="px-3 py-2 border border-gray-300 border-l-0 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        {units.map(unit => (
                          <option key={unit.value} value={unit.value}>{unit.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harvest Date
                    </label>
                    <input
                      type="date"
                      name="harvestDate"
                      value={productForm.harvestDate}
                      onChange={handleProductFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={productForm.expiryDate}
                      onChange={handleProductFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleProductFormChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Describe your product quality, farming methods, etc."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District *
                    </label>
                    <select
                      name="location.district"
                      value={productForm.location.district}
                      onChange={handleProductFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="">Select district</option>
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province *
                    </label>
                    <select
                      name="location.province"
                      value={productForm.location.province}
                      onChange={handleProductFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="">Select province</option>
                      {provinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specific Location/Address *
                  </label>
                  <textarea
                    name="location.address"
                    value={productForm.location.address}
                    onChange={handleProductFormChange}
                    required
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter specific location or farm address"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
                  >
                    {loading ? 'Adding...' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProduct && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Product</h3>
                <button
                  onClick={() => setShowEditProduct(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedProduct) return;

                  setLoading(true);
                  setError('');
                  setSuccess('');

                  try {
                    const response = await fetch('/api/seller/products', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        ...productForm,
                        sellerId: seller._id,
                        pricePerKg: Number(productForm.pricePerKg),
                        availableQuantity: Number(productForm.availableQuantity),
                        _id: selectedProduct._id,
                      }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                      handleEditProduct(data.product);
                      setShowEditProduct(false);
                      setProductForm({
                        name: '',
                        category: 'vegetables',
                        variety: '',
                        description: '',
                        pricePerKg: '',
                        availableQuantity: '',
                        unit: 'kg',
                        harvestDate: '',
                        expiryDate: '',
                        quality: 'standard',
                        location: {
                          district: seller.district,
                          province: seller.province,
                          address: seller.address,
                        },
                      });
                      setSuccess('Product updated successfully!');
                    } else {
                      setError(data.error || 'Failed to update product');
                    }
                  } catch (error) {
                    setError('Error updating product');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={productForm.name}
                      onChange={handleProductFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleProductFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variety
                    </label>
                    <input
                      type="text"
                      name="variety"
                      value={productForm.variety}
                      onChange={handleProductFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="e.g., Red Lady, Ambul"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quality *
                    </label>
                    <select
                      name="quality"
                      value={productForm.quality}
                      onChange={handleProductFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      {qualities.map(quality => (
                        <option key={quality.value} value={quality.value}>{quality.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Kg (Rs.) *
                    </label>
                    <input
                      type="number"
                      name="pricePerKg"
                      value={productForm.pricePerKg}
                      onChange={handleProductFormChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Enter price per kg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Available Quantity *
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        name="availableQuantity"
                        value={productForm.availableQuantity}
                        onChange={handleProductFormChange}
                        required
                        min="0"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Quantity"
                      />
                      <select
                        name="unit"
                        value={productForm.unit}
                        onChange={handleProductFormChange}
                        className="px-3 py-2 border border-gray-300 border-l-0 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        {units.map(unit => (
                          <option key={unit.value} value={unit.value}>{unit.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harvest Date
                    </label>
                    <input
                      type="date"
                      name="harvestDate"
                      value={productForm.harvestDate}
                      onChange={handleProductFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={productForm.expiryDate}
                      onChange={handleProductFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleProductFormChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Describe your product quality, farming methods, etc."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District *
                    </label>
                    <select
                      name="location.district"
                      value={productForm.location.district}
                      onChange={handleProductFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="">Select district</option>
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province *
                    </label>
                    <select
                      name="location.province"
                      value={productForm.location.province}
                      onChange={handleProductFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="">Select province</option>
                      {provinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specific Location/Address *
                  </label>
                  <textarea
                    name="location.address"
                    value={productForm.location.address}
                    onChange={handleProductFormChange}
                    required
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter specific location or farm address"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditProduct(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg"
                  >
                    {loading ? 'Updating...' : 'Update Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Product Edit Modal */}
      {selectedProduct && (
        <ProductEditModal
          product={selectedProduct}
          isOpen={showEditProduct}
          onClose={() => {
            setShowEditProduct(false);
            setSelectedProduct(null);
          }}
          onSave={handleEditProduct}
          onDelete={handleDeleteFromModal}
        />
      )}
    </div>
  );
}
