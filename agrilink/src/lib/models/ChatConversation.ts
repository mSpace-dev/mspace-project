import mongoose, { Schema, Document } from 'mongoose';

export interface IChatConversation extends Document {
  userId?: string;
  userPhone?: string;
  userMessage: string;
  botResponse: string;
  intent?: string;
  entities?: {
    product?: string;
    location?: string;
    action?: string;
  };
  sessionId: string;
  timestamp: Date;
  responseTime?: number;
  feedback?: 'helpful' | 'not_helpful';
  createdAt: Date;
  updatedAt: Date;
}

const ChatConversationSchema: Schema = new Schema({
  userId: {
    type: String,
    ref: 'Customer',
    required: false
  },
  userPhone: {
    type: String,
    required: false
  },
  userMessage: {
    type: String,
    required: true,
    maxlength: 1000
  },
  botResponse: {
    type: String,
    required: true,
    maxlength: 5000
  },
  intent: {
    type: String,
    enum: ['price_inquiry', 'service_info', 'forecast', 'market_info', 'alert_setup', 'help', 'general'],
    default: 'general'
  },
  entities: {
    product: String,
    location: String,
    action: String
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  responseTime: {
    type: Number,
    min: 0
  },
  feedback: {
    type: String,
    enum: ['helpful', 'not_helpful'],
    required: false
  }
}, {
  timestamps: true,
  collection: 'chatConversations'
});

// Indexes for better query performance
ChatConversationSchema.index({ userId: 1, timestamp: -1 });
ChatConversationSchema.index({ userPhone: 1, timestamp: -1 });
ChatConversationSchema.index({ sessionId: 1, timestamp: -1 });
ChatConversationSchema.index({ intent: 1, timestamp: -1 });

const ChatConversation = mongoose.models.ChatConversation || mongoose.model<IChatConversation>('ChatConversation', ChatConversationSchema);

export default ChatConversation;