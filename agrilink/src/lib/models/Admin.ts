import mongoose from 'mongoose';

export interface IAdmin {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'super_admin' | 'admin';
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminSchema = new mongoose.Schema<IAdmin>({
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
  role: {
    type: String,
    enum: ['super_admin', 'admin'],
    default: 'admin',
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_products',
      'manage_prices',
      'view_analytics',
      'send_notifications',
      'manage_settings',
      'manage_admins'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Create index for email
AdminSchema.index({ email: 1 });

const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
