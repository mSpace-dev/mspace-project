import mongoose from 'mongoose';

// Individual seller's product offerings
const SellerProductSchema = new mongoose.Schema({
  productCatalogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCatalog',
    required: true,
    index: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
    index: true
  },
  variety: {
    type: String,
    default: ''
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

// Compound indexes
SellerProductSchema.index({ productCatalogId: 1, sellerId: 1 }, { unique: true });
SellerProductSchema.index({ sellerId: 1, isActive: 1 });

export default mongoose.models.SellerProduct || mongoose.model('SellerProduct', SellerProductSchema);
