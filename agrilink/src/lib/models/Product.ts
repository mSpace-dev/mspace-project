import mongoose from 'mongoose';

export interface IProduct {
  _id?: string;
  sellerId: mongoose.Types.ObjectId;
  name: string;
  category: 'vegetables' | 'fruits' | 'grains' | 'spices' | 'herbs' | 'dairy' | 'coconut' | 'other';
  variety?: string;
  description?: string;
  pricePerKg: number;
  availableQuantity: number;
  unit: 'kg' | 'g' | 'tons' | 'pieces' | 'bundles';
  harvestDate?: Date;
  expiryDate?: Date;
  quality: 'premium' | 'standard' | 'organic';
  location: {
    district: string;
    province: string;
    address: string;
  };
  images: string[];
  status: 'available' | 'sold' | 'expired' | 'pending';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new mongoose.Schema<IProduct>({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['vegetables', 'fruits', 'grains', 'spices', 'herbs', 'dairy', 'coconut', 'other'],
    required: [true, 'Please select a category'],
  },
  variety: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  pricePerKg: {
    type: Number,
    required: [true, 'Please provide price per kg'],
    min: [0, 'Price cannot be negative'],
  },
  availableQuantity: {
    type: Number,
    required: [true, 'Please provide available quantity'],
    min: [0, 'Quantity cannot be negative'],
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'tons', 'pieces', 'bundles'],
    default: 'kg',
  },
  harvestDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
  quality: {
    type: String,
    enum: ['premium', 'standard', 'organic'],
    default: 'standard',
  },
  location: {
    district: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  images: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['available', 'sold', 'expired', 'pending'],
    default: 'available',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Create indexes for better query performance
ProductSchema.index({ sellerId: 1 });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ 'location.district': 1, 'location.province': 1 });
ProductSchema.index({ pricePerKg: 1 });
ProductSchema.index({ createdAt: -1 });

const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
