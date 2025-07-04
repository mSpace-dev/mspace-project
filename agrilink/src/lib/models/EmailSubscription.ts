import mongoose from 'mongoose';

export interface IEmailSubscription {
  _id?: string;
  email: string;
  isActive: boolean;
  subscriptionDate: Date;
  lastEmailSent?: Date;
  preferences: {
    priceAlerts: boolean;
    weeklyDigest: boolean;
    marketNews: boolean;
    forecastUpdates: boolean;
  };
  unsubscribeToken: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const EmailSubscriptionSchema = new mongoose.Schema<IEmailSubscription>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  subscriptionDate: {
    type: Date,
    default: Date.now,
  },
  lastEmailSent: {
    type: Date,
  },
  preferences: {
    priceAlerts: {
      type: Boolean,
      default: true,
    },
    weeklyDigest: {
      type: Boolean,
      default: true,
    },
    marketNews: {
      type: Boolean,
      default: true,
    },
    forecastUpdates: {
      type: Boolean,
      default: true,
    },
  },
  unsubscribeToken: {
    type: String,
    required: true,
    unique: true,
  },
}, {
  timestamps: true,
});

// Index for performance
EmailSubscriptionSchema.index({ email: 1 });
EmailSubscriptionSchema.index({ isActive: 1 });
EmailSubscriptionSchema.index({ unsubscribeToken: 1 });

const EmailSubscription = mongoose.models.EmailSubscription || mongoose.model<IEmailSubscription>('EmailSubscription', EmailSubscriptionSchema);

export default EmailSubscription;
