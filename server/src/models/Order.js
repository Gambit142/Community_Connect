const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventID: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  amount: { type: Number, required: true, min: 0 }, // Total in dollars (e.g., 25.00 for 1 ticket at $25)
  currency: { type: String, default: 'cad' },
  tickets: { type: Number, required: true, min: 1, max: 10 }, // Number of tickets
  specialRequests: { type: String, default: '' }, // Optional requests
  stripeSessionId: { type: String, unique: true }, // set after session creation for paid, dummy for free
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  // Optional: Payment method details (from Stripe webhook)
  paymentMethod: { type: String }, // e.g., 'Card ending 1234' or 'Free Registration'
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