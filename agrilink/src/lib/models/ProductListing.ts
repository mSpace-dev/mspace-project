import mongoose from 'mongoose';

// Individual product listing by seller
const ProductListingSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['vegetables', 'fruits', 'grains', 'spices', 'herbs', 'dairy', 'coconut', 'other'],
    index: true
  },
  variety: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
    index: true
  },
  pricePerKg: {
    type: Number,
    required: true,
    min: 0
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'kg'
  },
  harvestDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  quality: {
    type: String,
    enum: ['premium', 'standard', 'organic'],
    default: 'standard'
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
ProductListingSchema.index({ productName: 1, sellerId: 1 });
ProductListingSchema.index({ category: 1, isActive: 1 });
ProductListingSchema.index({ productName: 1, isActive: 1 });

export default mongoose.models.ProductListing || mongoose.model('ProductListing', ProductListingSchema);
