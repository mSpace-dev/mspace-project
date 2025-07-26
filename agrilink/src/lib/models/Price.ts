import mongoose from 'mongoose';

export interface IPrice {
  _id?: string;
  productName: string;
  category: 'vegetables' | 'fruits' | 'grains' | 'spices' | 'herbs' | 'dairy' | 'coconut' | 'other';
  variety?: string;
  pricePerKg: number;
  unit: 'kg' | 'g' | 'tons' | 'pieces' | 'bundles';
  market: string;
  location: {
    district: string;
    province: string;
    market: string;
  };
  date: Date;
  source: 'market' | 'seller' | 'api' | 'manual';
  quality: 'premium' | 'standard' | 'organic';
  verified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const PriceSchema = new mongoose.Schema<IPrice>({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    index: true,
  },
  category: {
    type: String,
    enum: ['vegetables', 'fruits', 'grains', 'spices', 'herbs', 'dairy', 'coconut', 'other'],
    required: [true, 'Category is required'],
    index: true,
  },
  variety: {
    type: String,
    trim: true,
  },
  pricePerKg: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'tons', 'pieces', 'bundles'],
    default: 'kg',
  },
  market: {
    type: String,
    required: [true, 'Market name is required'],
    trim: true,
  },
  location: {
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
      index: true,
    },
    province: {
      type: String,
      required: [true, 'Province is required'],
      trim: true,
      index: true,
    },
    market: {
      type: String,
      required: [true, 'Market is required'],
      trim: true,
    },
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true,
  },
  source: {
    type: String,
    enum: ['market', 'seller', 'api', 'manual'],
    default: 'manual',
  },
  quality: {
    type: String,
    enum: ['premium', 'standard', 'organic'],
    default: 'standard',
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
PriceSchema.index({ productName: 1, date: -1 });
PriceSchema.index({ category: 1, date: -1 });
PriceSchema.index({ 'location.district': 1, date: -1 });
PriceSchema.index({ 'location.province': 1, date: -1 });

const Price = mongoose.models.Price || mongoose.model<IPrice>('Price', PriceSchema);

export default Price;
