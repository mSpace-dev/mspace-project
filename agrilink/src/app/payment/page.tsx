'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Package, 
  DollarSign,
  Shield,
  ArrowLeft,
  Check
} from 'lucide-react';
import CustomerNavBar from "../../components/CustomerNavBar";
import { useCustomerAuth } from "../../hooks/useCustomerAuth";

interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'digital' | 'cod' | 'bank';
  icon: React.ReactNode;
  description: string;
  processingFee?: number;
}

interface ProductInfo {
  productId: string;
  sellerId: string;
  productName: string;
  sellerName: string;
  pricePerKg: number;
  quantity: number;
  unit: string;
  total: number;
}

export default function PaymentPage() {
  const { customer, isLoading: authLoading, isAuthenticated, redirectToLogin } = useCustomerAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get product details from URL params
  const productId = searchParams.get('productId');
  const sellerId = searchParams.get('sellerId');
  const productName = searchParams.get('productName');
  const sellerName = searchParams.get('sellerName');
  const price = searchParams.get('price');
  const unit = searchParams.get('unit');
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStep, setOrderStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  
  // Delivery Information
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: '',
    district: customer?.district || '',
    province: customer?.province || '',
    postalCode: '',
    specialInstructions: ''
  });

  // Card Payment Details
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      name: 'Credit/Debit Card (Stripe)',
      type: 'card',
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Secure payment with Visa, MasterCard, American Express',
      processingFee: 2.9
    },
    {
      id: 'payhere',
      name: 'PayHere',
      type: 'digital',
      icon: <DollarSign className="h-6 w-6" />,
      description: 'Sri Lankan online payment gateway',
      processingFee: 3.5
    },
    {
      id: 'bank-transfer',
      name: 'Bank Transfer',
      type: 'bank',
      icon: <Shield className="h-6 w-6" />,
      description: 'Direct bank transfer (Manual verification required)',
      processingFee: 0
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      type: 'cod',
      icon: <Truck className="h-6 w-6" />,
      description: 'Pay when you receive your order',
      processingFee: 0
    }
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      redirectToLogin();
      return;
    }
  }, [authLoading, isAuthenticated, redirectToLogin]);

  useEffect(() => {
    if (customer) {
      setDeliveryInfo(prev => ({
        ...prev,
        fullName: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        district: customer.district || '',
        province: customer.province || ''
      }));
    }
  }, [customer]);

  if (authLoading || !customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!productId || !price) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerNavBar customer={customer} />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Payment Request</h1>
          <p className="text-gray-600 mb-8">The payment information is incomplete or invalid.</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const pricePerKg = parseFloat(price);
  const subtotal = pricePerKg * quantity;
  const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
  const processingFee = selectedMethod?.processingFee ? (subtotal * selectedMethod.processingFee / 100) : 0;
  const deliveryFee = selectedPaymentMethod === 'cod' ? 250 : 150; // COD has higher delivery fee
  const total = subtotal + processingFee + deliveryFee;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleDeliveryInfoChange = (field: string, value: string) => {
    setDeliveryInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCardDetailsChange = (field: string, value: string) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateDeliveryInfo = () => {
    const required = ['fullName', 'phone', 'email', 'address', 'district', 'province'];
    return required.every(field => deliveryInfo[field as keyof typeof deliveryInfo].trim() !== '');
  };

  const validateCardDetails = () => {
    if (selectedPaymentMethod !== 'stripe') return true;
    const required = ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'];
    return required.every(field => cardDetails[field as keyof typeof cardDetails].trim() !== '');
  };

  const handleProceedToPayment = () => {
    if (!validateDeliveryInfo()) {
      alert('Please fill in all required delivery information.');
      return;
    }
    setOrderStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      alert('Please select a payment method.');
      return;
    }

    if (!validateCardDetails()) {
      alert('Please fill in all required card details.');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        productId,
        sellerId,
        productName,
        sellerName,
        pricePerKg: parseFloat(price || '0'),
        quantity,
        unit,
        subtotal,
        processingFee,
        deliveryFee,
        total,
        paymentMethod: selectedPaymentMethod,
        deliveryInfo,
        cardDetails: selectedPaymentMethod === 'stripe' ? cardDetails : undefined,
        customerId: customer?._id || customer?.customerId
      };

      console.log('Order data being sent:', orderData);

      // Get token from localStorage (try both possible keys)
      const token = localStorage.getItem('customerToken') || localStorage.getItem('token');
      console.log('Token found:', !!token);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(orderData)
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Order created successfully:', result);
        
        // Store the created order
        setCreatedOrder(result.order);
        
        // Handle different payment methods
        if (selectedPaymentMethod === 'stripe') {
          // Redirect to Stripe checkout
          window.location.href = result.checkoutUrl;
        } else if (selectedPaymentMethod === 'payhere') {
          // Redirect to PayHere
          window.location.href = result.paymentUrl;
        } else {
          // For COD and bank transfer, show confirmation
          setOrderStep('confirmation');
        }
      } else {
        let errorMessage = 'Failed to create order. Please try again.';
        try {
          const error = await response.json();
          console.error('Order creation failed:', error);
          console.error('Response status:', response.status);
          console.error('Response headers:', Object.fromEntries(response.headers.entries()));
          errorMessage = error.message || error.error || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          console.error('Raw response:', response);
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavBar customer={customer} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Order</h1>
          
          {/* Progress Steps */}
          <div className="flex items-center mt-6 space-x-4">
            <div className={`flex items-center ${orderStep === 'details' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                orderStep === 'details' ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Order Details</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className={`flex items-center ${orderStep === 'payment' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                orderStep === 'payment' ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className={`flex items-center ${orderStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                orderStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {orderStep === 'details' && (
              <div className="space-y-6">
                {/* Product Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                      <p className="text-gray-900 font-medium">{productName}</p>
                      <p className="text-sm text-gray-600">From: {sellerName}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price per {unit}</label>
                        <p className="text-gray-900">LKR {pricePerKg.toFixed(2)}</p>
                      </div>
                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity ({unit})
                        </label>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(quantity - 1)}
                            className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center text-gray-900"
                            min="1"
                          />
                          <button
                            onClick={() => handleQuantityChange(quantity + 1)}
                            className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          id="fullName"
                          value={deliveryInfo.fullName}
                          onChange={(e) => handleDeliveryInfoChange('fullName', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          id="phone"
                          value={deliveryInfo.phone}
                          onChange={(e) => handleDeliveryInfoChange('phone', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                          placeholder="0771234567"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          value={deliveryInfo.email}
                          onChange={(e) => handleDeliveryInfoChange('email', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                        District *
                      </label>
                      <select
                        id="district"
                        value={deliveryInfo.district}
                        onChange={(e) => handleDeliveryInfoChange('district', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                        required
                      >
                        <option value="">Select District</option>
                        <option value="Colombo">Colombo</option>
                        <option value="Gampaha">Gampaha</option>
                        <option value="Kalutara">Kalutara</option>
                        <option value="Kandy">Kandy</option>
                        <option value="Matale">Matale</option>
                        <option value="Nuwara Eliya">Nuwara Eliya</option>
                        <option value="Galle">Galle</option>
                        <option value="Matara">Matara</option>
                        <option value="Hambantota">Hambantota</option>
                        <option value="Jaffna">Jaffna</option>
                        <option value="Kilinochchi">Kilinochchi</option>
                        <option value="Mannar">Mannar</option>
                        <option value="Vavuniya">Vavuniya</option>
                        <option value="Mullaitivu">Mullaitivu</option>
                        <option value="Batticaloa">Batticaloa</option>
                        <option value="Ampara">Ampara</option>
                        <option value="Trincomalee">Trincomalee</option>
                        <option value="Kurunegala">Kurunegala</option>
                        <option value="Puttalam">Puttalam</option>
                        <option value="Anuradhapura">Anuradhapura</option>
                        <option value="Polonnaruwa">Polonnaruwa</option>
                        <option value="Badulla">Badulla</option>
                        <option value="Moneragala">Moneragala</option>
                        <option value="Ratnapura">Ratnapura</option>
                        <option value="Kegalle">Kegalle</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <textarea
                          id="address"
                          rows={3}
                          value={deliveryInfo.address}
                          onChange={(e) => handleDeliveryInfoChange('address', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                          placeholder="Enter your complete delivery address"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        value={deliveryInfo.postalCode}
                        onChange={(e) => handleDeliveryInfoChange('postalCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                        placeholder="10100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                        Special Delivery Instructions (Optional)
                      </label>
                      <textarea
                        id="specialInstructions"
                        rows={2}
                        value={deliveryInfo.specialInstructions}
                        onChange={(e) => handleDeliveryInfoChange('specialInstructions', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                        placeholder="Any special instructions for delivery..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {orderStep === 'payment' && (
              <div className="space-y-6">
                {/* Payment Methods */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPaymentMethod === method.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              selectedPaymentMethod === method.id
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedPaymentMethod === method.id && (
                                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                              )}
                            </div>
                            <div className="text-green-600">{method.icon}</div>
                            <div>
                              <h3 className="font-medium text-gray-900">{method.name}</h3>
                              <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                          </div>
                          {method.processingFee && (
                            <div className="text-sm text-gray-600">
                              +{method.processingFee}% fee
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Details for Stripe */}
                {selectedPaymentMethod === 'stripe' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Card Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number *
                        </label>
                        <input
                          type="text"
                          id="cardNumber"
                          value={cardDetails.cardNumber}
                          onChange={(e) => handleCardDetailsChange('cardNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          id="expiryDate"
                          value={cardDetails.expiryDate}
                          onChange={(e) => handleCardDetailsChange('expiryDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                          CVV *
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          value={cardDetails.cvv}
                          onChange={(e) => handleCardDetailsChange('cvv', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                          placeholder="123"
                          maxLength={4}
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          id="cardholderName"
                          value={cardDetails.cardholderName}
                          onChange={(e) => handleCardDetailsChange('cardholderName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Transfer Instructions */}
                {selectedPaymentMethod === 'bank-transfer' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Bank Transfer Details</h2>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-2">Transfer Instructions:</h3>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p><strong>Bank:</strong> Commercial Bank of Ceylon</p>
                        <p><strong>Account Name:</strong> AgriLink (Pvt) Ltd</p>
                        <p><strong>Account Number:</strong> 8001234567</p>
                        <p><strong>Branch:</strong> Colombo 03</p>
                        <p><strong>Amount:</strong> LKR {total.toFixed(2)}</p>
                      </div>
                      <p className="text-sm text-blue-700 mt-3">
                        Please use your order number as the reference and upload the bank slip after placing the order.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {orderStep === 'confirmation' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
                {createdOrder && (
                  <p className="text-sm text-gray-500 mb-2">Order ID: {createdOrder._id}</p>
                )}
                <p className="text-gray-600 mb-6">
                  Thank you for your order. You will receive a confirmation email shortly.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/customer/orders')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    View My Orders
                  </button>
                  <button
                    onClick={() => router.push('/products')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>{productName} ({quantity} {unit})</span>
                  <span>LKR {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Delivery Fee</span>
                  <span>LKR {deliveryFee.toFixed(2)}</span>
                </div>
                
                {processingFee > 0 && (
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Processing Fee ({selectedMethod?.processingFee}%)</span>
                    <span>LKR {processingFee.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Total</span>
                    <span>LKR {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                {orderStep === 'details' && (
                  <button
                    onClick={handleProceedToPayment}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    Proceed to Payment
                  </button>
                )}
                
                {orderStep === 'payment' && (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || !selectedPaymentMethod}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </button>
                )}
              </div>

              {/* Security Badge */}
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Shield className="h-4 w-4 mr-2" />
                <span>Secure payment protected by SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
