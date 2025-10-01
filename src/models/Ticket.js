const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true
  },
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'L\'événement est requis']
  },
  buyer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'L\'acheteur est requis']
  },
  ticketType: {
    name: {
      type: String,
      required: [true, 'Le nom du type de ticket est requis']
    },
    price: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix ne peut pas être négatif']
    }
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'used', 'cancelled', 'refunded'],
    default: 'active'
  },
  qrCode: {
    type: String,
    required: true
  },
  usedAt: Date,
  refundedAt: Date,
  refundAmount: Number,
  refundReason: String,
  additionalInfo: {
    seatNumber: String,
    section: String,
    row: String,
    specialRequests: String
  },
  paymentInfo: {
    transactionId: String,
    paymentMethod: {
      type: String,
      enum: ['card', 'paypal', 'transfer', 'cash'],
      default: 'card'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate unique ticket number before saving
TicketSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate ticket number format: EVENT_ID-YYYYMMDD-RANDOM
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.ticketNumber = `${this.event.toString().slice(-6)}-${date}-${random}`;
    
    // Generate QR code data
    this.qrCode = `TICKET:${this.ticketNumber}:${this.event}:${this.buyer}`;
  }
  next();
});

// Virtual for formatted ticket number
TicketSchema.virtual('formattedTicketNumber').get(function() {
  return this.ticketNumber.replace(/-/g, ' ');
});

// Method to use ticket
TicketSchema.methods.useTicket = function() {
  if (this.status !== 'active') {
    throw new Error('Ce ticket ne peut pas être utilisé');
  }
  
  this.status = 'used';
  this.usedAt = new Date();
  return this.save();
};

// Method to refund ticket
TicketSchema.methods.refundTicket = function(reason, amount) {
  if (this.status === 'used') {
    throw new Error('Ce ticket ne peut pas être remboursé car il a déjà été utilisé');
  }
  
  this.status = 'refunded';
  this.refundedAt = new Date();
  this.refundReason = reason;
  this.refundAmount = amount || this.ticketType.price;
  return this.save();
};

// Index for efficient queries
TicketSchema.index({ ticketNumber: 1 }, { unique: true });
TicketSchema.index({ event: 1 });
TicketSchema.index({ buyer: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ purchaseDate: -1 });

module.exports = mongoose.model('Ticket', TicketSchema);