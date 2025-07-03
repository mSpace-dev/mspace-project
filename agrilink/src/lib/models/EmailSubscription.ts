import mongoose from 'mongoose';

export interface IEmailSubscription {
  _id?: string;
  email: string;
  subscribed: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date | null;
  interests: string[];
  status: 'active' | 'inactive' | 'bounced';
  createdAt?: Date;
  updatedAt?: Date;
}

const EmailSubscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  subscribed: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date,
    default: null
  },
  interests: [{
    type: String,
    enum: ['price_alerts', 'market_news', 'weather_updates', 'demand_forecasts', 'all']
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'bounced'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Create unique index
EmailSubscriptionSchema.index({ email: 1 }, { unique: true });

const EmailSubscription = mongoose.models.EmailSubscription || mongoose.model<IEmailSubscription>('EmailSubscription', EmailSubscriptionSchema);

export default EmailSubscription;