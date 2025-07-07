import mongoose from 'mongoose';

export interface ICartItem {
  _id?: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;
  serviceId?: string;
  name: string;
  type: 'product' | 'service' | 'subscription';
  price: number;
  quantity: number;
  image?: string;
  description: string;
  seller: string;
  addedAt: Date;
}

export interface ICart {
  _id?: string;
  customerId: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const CartItemSchema = new mongoose.Schema<ICartItem>({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: function() {
      return this.type === 'product';
    }
  },
  serviceId: {
    type: String,
    required: function() {
      return this.type === 'service' || this.type === 'subscription';
    }
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['product', 'service', 'subscription'],
    required: [true, 'Item type is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  image: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  seller: {
    type: String,
    required: [true, 'Seller information is required'],
    trim: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  }
}, { _id: true });

const CartSchema = new mongoose.Schema<ICart>({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer ID is required'],
    unique: true,
  },
  items: [CartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, 'Total amount cannot be negative'],
  },
}, {
  timestamps: true,
});

// Pre-save middleware to calculate total amount
CartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  next();
});

// Create index for better query performance
CartSchema.index({ customerId: 1 });

const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
