const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventID: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  amount: { type: Number, required: true, min: 0 }, // In dollars (e.g., 25.00)
  currency: { type: String, default: 'usd' },
  stripeSessionId: { type: String, required: true, unique: true }, // For tracking/refunds
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  // Optional: Payment method details (from Stripe webhook)
  paymentMethod: { type: String }, // e.g., 'card_...'
  // Optional: Refund reason if refunded
  refundReason: { type: String },
}, { 
  timestamps: true, // Auto createdAt/updatedAt
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; } },
  toObject: { virtuals: true }
});

// Indexes for efficient queries (admin reports)
orderSchema.index({ eventID: 1, status: 1 });
orderSchema.index({ userID: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 }); // Recent orders

// Virtuals for populated refs
orderSchema.virtual('event', {
  ref: 'Event',
  localField: 'eventID',
  foreignField: '_id',
  justOne: true,
});
orderSchema.virtual('user', {
  ref: 'User',
  localField: 'userID',
  foreignField: '_id',
  justOne: true,
});

module.exports = mongoose.model('Order', orderSchema);