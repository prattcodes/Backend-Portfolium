const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const BlogSchema = new mongoose.Schema({
  blogId: {
    type: String,
    default: uuidv4,  // Generate a UUID for each new blog
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  url: {
    type: String,
    trim: true
  },
  image: {
    imageId: String,
    url: String
  },
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true
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
BlogSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Blog', BlogSchema);