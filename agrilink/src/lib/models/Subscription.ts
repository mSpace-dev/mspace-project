import { Schema, model, models } from 'mongoose';

export interface ISubscription {
  userId: string;
  type: 'daily' | 'priceChange' | 'predicted';
  categories: string[];
  crops: string[];
  location: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['daily', 'priceChange', 'predicted'], required: true },
    categories: { type: [String], default: [] },
    crops: { type: [String], default: [] },
    location: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Subscription = models.Subscription || model<ISubscription>('Subscription', SubscriptionSchema);

