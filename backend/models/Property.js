const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  // Add this field at the top
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Property Details
  propertyName: {
    type: String,
    required: true,
    trim: true,
  },
  
  propertyType: {
    type: String,
    enum: ['apartment', 'tenament', 'villa'],
    required: true,
  },
  sqft: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    googleMapsUrl: { type: String },
  },
  facilities: {
    type: [String],
    default: [],
  },
  bhk: {
    type: String,
    enum: ['1BHK', '2BHK', '3BHK', '4BHK', '5BHK'],
    required: true,
  },
  propertyFor: {
    type: String,
    enum: ['sell', 'rent'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  
  // Owner Details
  ownerName: {
    type: String,
    required: true,
  },
  ownerEmail: {
    type: String,
    required: true,
  },
  ownerPhone: {
    type: String,
    required: true,
  },
  
  // Images
  propertyImages: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length >= 5 && v.length <= 7;
      },
      message: 'Property must have between 5 and 7 images',
    },
  },
  propertyProof: {
    type: String,
    required: true,
  },
  
  // Charges and Payment
  charges: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'netbanking', 'upi'],
    required: true,
  },
  paymentDetails: {
    type: Object,
    default: {},
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  rejectionReason: {
    type: String,
    default: null,
  },
  
  // NEW: Sold status
  sold: {
    type: Boolean,
    default: false,
  },
  soldDate: {
    type: Date,
    default: null,
  },
  
  // Receipt
  receiptUrl: {
    type: String,
    default: null,
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
propertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Property', propertySchema);