import mongoose from 'mongoose';

export interface ICustomer {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  district: string;
  province: string;
  priceAlerts: {
    crop: string;
    maxPrice: number;
    minPrice: number;
    isActive: boolean;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const CustomerSchema = new mongoose.Schema<ICustomer>({
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
  priceAlerts: [{
    crop: {
      type: String,
      required: true,
    },
    maxPrice: {
      type: Number,
      required: true,
    },
    minPrice: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  }],
}, {
  timestamps: true,
});

const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
