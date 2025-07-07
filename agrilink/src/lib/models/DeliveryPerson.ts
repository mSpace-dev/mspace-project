import mongoose from 'mongoose';

const DeliveryPersonSchema = new mongoose.Schema({
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    nicNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      },
      relationship: {
        type: String,
        trim: true
      }
    }
  },
  bankDetails: {
    bankName: {
      type: String,
      trim: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    accountHolderName: {
      type: String,
      trim: true
    },
    branchCode: {
      type: String,
      trim: true
    },
    swiftCode: {
      type: String,
      trim: true
    }
  },
  documents: {
    nicCardUrl: {
      type: String,
      trim: true
    },
    signatureUrl: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  vehicleInfo: {
    type: {
      type: String,
      trim: true
    },
    licensePlate: {
      type: String,
      trim: true
    },
    model: {
      type: String,
      trim: true
    }
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
DeliveryPersonSchema.index({ 'personalInfo.email': 1 });
DeliveryPersonSchema.index({ 'personalInfo.nicNumber': 1 });
DeliveryPersonSchema.index({ status: 1 });
DeliveryPersonSchema.index({ createdAt: -1 });

// Virtual for full name
DeliveryPersonSchema.virtual('fullName').get(function() {
  return `${this.personalInfo?.firstName || ''} ${this.personalInfo?.lastName || ''}`.trim();
});

const DeliveryPerson = mongoose.models.DeliveryPerson || mongoose.model('DeliveryPerson', DeliveryPersonSchema);

export default DeliveryPerson;
