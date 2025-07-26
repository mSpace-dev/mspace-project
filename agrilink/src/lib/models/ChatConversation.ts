import mongoose from 'mongoose';

export interface IChatConversation {
  _id?: string;
  userId?: string;
  userPhone?: string;
  userMessage: string;
  botResponse: string;
  intent?: string;
  entities?: {
    product?: string;
    location?: string;
    priceRange?: string;
    action?: string;
  };
  sessionId?: string;
  timestamp: Date;
  responseTime?: number;
  satisfaction?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ChatConversationSchema = new mongoose.Schema<IChatConversation>({
  userId: {
    type: String,
    trim: true,
    index: true,
  },
  userPhone: {
    type: String,
    trim: true,
    index: true,
  },
  userMessage: {
    type: String,
    required: [true, 'User message is required'],
    trim: true,
  },
  botResponse: {
    type: String,
    required: [true, 'Bot response is required'],
    trim: true,
  },
  intent: {
    type: String,
    trim: true,
    enum: ['price_inquiry', 'market_info', 'weather', 'forecast', 'alert_setup', 'general', 'help'],
  },
  entities: {
    product: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    priceRange: {
      type: String,
      trim: true,
    },
    action: {
      type: String,
      trim: true,
    },
  },
  sessionId: {
    type: String,
    trim: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  responseTime: {
    type: Number,
    min: 0,
  },
  satisfaction: {
    type: Number,
    min: 1,
    max: 5,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
ChatConversationSchema.index({ userId: 1, timestamp: -1 });
ChatConversationSchema.index({ userPhone: 1, timestamp: -1 });
ChatConversationSchema.index({ sessionId: 1, timestamp: -1 });
ChatConversationSchema.index({ intent: 1, timestamp: -1 });

const ChatConversation = mongoose.models.ChatConversation || mongoose.model<IChatConversation>('ChatConversation', ChatConversationSchema);

export default ChatConversation;
