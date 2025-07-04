import mongoose from 'mongoose';

export interface INewsletterMessage {
  _id?: string;
  title: string;
  content: string;
  messageType: 'service_announcement' | 'platform_notice' | 'feature_update' | 'market_insight' | 'special_offer';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isActive: boolean;
  scheduledDate?: Date;
  sentDate?: Date;
  sentToCount?: number;
  targetAudience: {
    allSubscribers: boolean;
    priceAlertsOnly: boolean;
    marketNewsOnly: boolean;
    weeklyDigestOnly: boolean;
  };
  emailSubject: string;
  htmlContent: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const NewsletterMessageSchema = new mongoose.Schema<INewsletterMessage>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  messageType: {
    type: String,
    enum: ['service_announcement', 'platform_notice', 'feature_update', 'market_insight', 'special_offer'],
    required: true,
    default: 'service_announcement'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    required: true,
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  scheduledDate: {
    type: Date
  },
  sentDate: {
    type: Date
  },
  sentToCount: {
    type: Number,
    default: 0
  },
  targetAudience: {
    allSubscribers: {
      type: Boolean,
      default: true
    },
    priceAlertsOnly: {
      type: Boolean,
      default: false
    },
    marketNewsOnly: {
      type: Boolean,
      default: false
    },
    weeklyDigestOnly: {
      type: Boolean,
      default: false
    }
  },
  emailSubject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true,
    maxlength: [150, 'Email subject cannot exceed 150 characters']
  },
  htmlContent: {
    type: String,
    required: [true, 'HTML content is required']
  },
  createdBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
});

// Indexes for performance
NewsletterMessageSchema.index({ messageType: 1 });
NewsletterMessageSchema.index({ priority: 1 });
NewsletterMessageSchema.index({ isActive: 1 });
NewsletterMessageSchema.index({ scheduledDate: 1 });
NewsletterMessageSchema.index({ sentDate: 1 });

const NewsletterMessage = mongoose.models.NewsletterMessage || mongoose.model<INewsletterMessage>('NewsletterMessage', NewsletterMessageSchema);

export default NewsletterMessage;
