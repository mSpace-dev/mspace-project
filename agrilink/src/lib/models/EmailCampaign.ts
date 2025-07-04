import mongoose from 'mongoose';

export interface IEmailCampaign {
  _id?: string;
  subject: string;
  message: string;
  sentAt: Date;
  sentToCount: number;
  sentBy?: string; // Admin who sent the email
  recipientEmails: string[]; // List of emails it was sent to
  status: 'sent' | 'failed' | 'partial'; // Campaign status
  errorCount?: number; // Number of failed sends
  campaignType: 'manual' | 'automated'; // Type of campaign
  createdAt?: Date;
  updatedAt?: Date;
}

const EmailCampaignSchema = new mongoose.Schema<IEmailCampaign>({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [10000, 'Message cannot exceed 10000 characters']
  },
  sentAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  sentToCount: {
    type: Number,
    required: true,
    min: 0
  },
  sentBy: {
    type: String,
    trim: true,
    default: 'Admin'
  },
  recipientEmails: [{
    type: String,
    required: true,
    lowercase: true,
    trim: true
  }],
  status: {
    type: String,
    enum: ['sent', 'failed', 'partial'],
    required: true,
    default: 'sent'
  },
  errorCount: {
    type: Number,
    default: 0,
    min: 0
  },
  campaignType: {
    type: String,
    enum: ['manual', 'automated'],
    required: true,
    default: 'manual'
  }
}, {
  timestamps: true,
});

// Indexes for performance
EmailCampaignSchema.index({ sentAt: -1 });
EmailCampaignSchema.index({ status: 1 });
EmailCampaignSchema.index({ campaignType: 1 });
EmailCampaignSchema.index({ sentBy: 1 });

const EmailCampaign = mongoose.models.EmailCampaign || mongoose.model<IEmailCampaign>('EmailCampaign', EmailCampaignSchema);

export default EmailCampaign;
