import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId?: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface IOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cod' | 'card' | 'bank';
  shippingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    district?: string;
    province?: string;
    postalCode?: string;
  };
  supplier?: {
    id: mongoose.Types.ObjectId;
    name: string;
    businessName?: string;
    phone?: string;
    email?: string;
    claimedAt: Date;
    estimatedDeliveryDate?: Date;
  };
  tracking?: Array<{
    status: string;
    note?: string;
    at: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String }
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: { type: [OrderItemSchema], required: true },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'failed', 'refunded'], default: 'unpaid' },
  paymentMethod: { type: String, enum: ['cod', 'card', 'bank'], default: 'cod' },
  shippingAddress: {
    line1: String,
    line2: String,
    city: String,
    district: String,
    province: String,
    postalCode: String
  },
  supplier: {
    id: { type: Schema.Types.ObjectId, ref: 'Seller' },
    name: { type: String },
    businessName: { type: String },
    phone: { type: String },
    email: { type: String },
    claimedAt: { type: Date },
    estimatedDeliveryDate: { type: Date }
  },
  tracking: [{
    status: { type: String, required: true },
    note: String,
    at: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;


