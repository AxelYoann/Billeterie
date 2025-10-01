const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre de l\'événement est requis'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'Provider',
    required: [true, 'Le prestataire est requis']
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: [
      'concert',
      'theatre',
      'cinema',
      'sport',
      'conference',
      'exposition',
      'festival',
      'spectacle',
      'autre'
    ]
  },
  images: [{
    type: String
  }],
  venue: {
    name: {
      type: String,
      required: [true, 'Le nom du lieu est requis']
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
        default: 'France'
      }
    },
    capacity: {
      type: Number,
      required: [true, 'La capacité est requise'],
      min: [1, 'La capacité doit être d\'au moins 1 personne']
    }
  },
  dateTime: {
    start: {
      type: Date,
      required: [true, 'La date de début est requise']
    },
    end: {
      type: Date,
      required: [true, 'La date de fin est requise']
    }
  },
  ticketTypes: [{
    name: {
      type: String,
      required: [true, 'Le nom du type de ticket est requis']
    },
    description: String,
    price: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix ne peut pas être négatif']
    },
    quantity: {
      type: Number,
      required: [true, 'La quantité est requise'],
      min: [0, 'La quantité ne peut pas être négative']
    },
    quantityAvailable: {
      type: Number,
      required: true
    },
    maxPerPerson: {
      type: Number,
      default: 10,
      min: [1, 'Maximum 1 ticket par personne minimum']
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  seoData: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
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

// Virtual for total tickets sold
EventSchema.virtual('totalTicketsSold').get(function() {
  return this.ticketTypes.reduce((total, type) => {
    return total + (type.quantity - type.quantityAvailable);
  }, 0);
});

// Virtual for venue full address
EventSchema.virtual('venueFullAddress').get(function() {
  const { street, city, postalCode, country } = this.venue.address;
  return `${street ? street + ', ' : ''}${city}, ${postalCode}, ${country}`;
});

// Virtual for event status (upcoming, ongoing, ended)
EventSchema.virtual('eventStatus').get(function() {
  const now = new Date();
  if (now < this.dateTime.start) return 'upcoming';
  if (now >= this.dateTime.start && now <= this.dateTime.end) return 'ongoing';
  return 'ended';
});

// Validation: end date must be after start date
EventSchema.pre('save', function(next) {
  if (this.dateTime.end <= this.dateTime.start) {
    next(new Error('La date de fin doit être postérieure à la date de début'));
  }
  
  // Initialize quantityAvailable for new ticket types
  this.ticketTypes.forEach(type => {
    if (type.quantityAvailable === undefined) {
      type.quantityAvailable = type.quantity;
    }
  });
  
  next();
});

// Index for search and filtering
EventSchema.index({ title: 'text', description: 'text', tags: 'text' });
EventSchema.index({ 'dateTime.start': 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ provider: 1 });
EventSchema.index({ status: 1 });

module.exports = mongoose.model('Event', EventSchema);