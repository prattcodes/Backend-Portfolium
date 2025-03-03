const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  isCurrentPosition: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field on save
ExperienceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validate that endDate is after startDate if provided
ExperienceSchema.pre('validate', function(next) {
  if (this.endDate && this.startDate && !this.current) {
    if (this.endDate < this.startDate) {
      this.invalidate('endDate', 'End date must be after start date');
    }
  }
  
  // If current is true, endDate should be null
  if (this.current) {
    this.endDate = null;
  }
  
  next();
});

module.exports = mongoose.model('Experience', ExperienceSchema);