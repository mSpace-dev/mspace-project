import mongoose from 'mongoose';

export interface ISeller {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  businessName: string;
  businessType: 'farmer' | 'wholesaler' | 'retailer' | 'cooperative';
  district: string;
  province: string;
  address: string;
  licenseNumber?: string;
  isVerified: boolean;
  products: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const SellerSchema = new mongoose.Schema<ISeller>({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
  },
  businessName: {
    type: String,
    required: [true, 'Please provide a business name'],
    trim: true,
  },
  businessType: {
    type: String,
    enum: ['farmer', 'wholesaler', 'retailer', 'cooperative'],
    required: [true, 'Please select a business type'],
  },
  district: {
    type: String,
    required: [true, 'Please provide a district'],
    trim: true,
  },
  province: {
    type: String,
    required: [true, 'Please provide a province'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Please provide an address'],
    trim: true,
  },
  licenseNumber: {
    type: String,
    trim: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
}, {
  timestamps: true,
});

// Create index for email
SellerSchema.index({ email: 1 });
SellerSchema.index({ district: 1, province: 1 });

const Seller = mongoose.models.Seller || mongoose.model<ISeller>('Seller', SellerSchema);

export default Seller;
