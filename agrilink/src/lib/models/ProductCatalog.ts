import mongoose from 'mongoose';

// Master product catalog (aggregated data)
const ProductCatalogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['vegetables', 'fruits', 'grains', 'spices', 'herbs', 'dairy', 'coconut', 'other'],
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  totalAvailableQuantity: {
    type: Number,
    default: 0
  },
  averagePrice: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'kg'
  },
  sellerCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.ProductCatalog || mongoose.model('ProductCatalog', ProductCatalogSchema);
