const mongoose = require('mongoose');

const ProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du prestataire est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  logo: {
    type: String,
    default: 'default-logo.png'
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Veuillez entrer une URL valide'
    ]
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez entrer un email valide'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Le téléphone est requis'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Veuillez entrer un numéro de téléphone valide']
  },
  address: {
    street: String,
    city: {
      type: String,
      required: [true, 'La ville est requise']
    },
    postalCode: {
      type: String,
      required: [true, 'Le code postal est requis']
    },
    country: {
      type: String,
      required: [true, 'Le pays est requis'],
      default: 'France'
    }
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  settings: {
    acceptsOnlinePayment: {
      type: Boolean,
      default: true
    },
    refundPolicy: {
      type: String,
      enum: ['none', 'partial', 'full'],
      default: 'partial'
    },
    commissionRate: {
      type: Number,
      default: 5,
      min: [0, 'Le taux de commission ne peut pas être négatif'],
      max: [50, 'Le taux de commission ne peut pas dépasser 50%']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for events
ProviderSchema.virtual('events', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'provider',
  justOne: false
});

// Virtual for full address
ProviderSchema.virtual('fullAddress').get(function() {
  const { street, city, postalCode, country } = this.address;
  return `${street ? street + ', ' : ''}${city}, ${postalCode}, ${country}`;
});

// Index for search
ProviderSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Provider', ProviderSchema);