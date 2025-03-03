const mongoose = require('mongoose');

const SocialLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: [true, 'Please specify the social platform'],
    enum: ['github', 'linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'dribbble', 'behance', 'medium', 'dev', 'stackoverflow', 'other']
  },
  url: {
    type: String,
    required: [true, 'Please add a URL'],
    match: [
      /^(https?:\/\/)?(([\w\-]+(\.[\w\-]+)+)|localhost)([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?$/,
      'Please add a valid URL'
    ]
  },
  title: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
});

const ContactSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  socialLinks: [{
    platform: String,
    url: String,
    label: String
  }]
});

const SettingsSchema = new mongoose.Schema({
  experienceSectionEnabled: {
    type: Boolean,
    default: true
  },
  blogsSectionEnabled: {
    type: Boolean,
    default: true
  },
  resumeEnabled: {
    type: Boolean,
    default: true
  },
  useProviderAvatar: {
    type: Boolean,
    default: false
  }
});

const PersonalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  position: {
    type: String,
    required: [true, 'Please add a position']
  },
  bio: {
    type: String,
    required: [true, 'Please add a bio']
  },
  profilePhotoId: String
});

const PortfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personal: {
    type: PersonalSchema,
    required: true
  },
  settings: {
    type: SettingsSchema,
    default: () => ({})
  },
  contact: {
    type: ContactSchema,
    required: true
  },
  resume: {
    fileId: String,
    fileName: String
  },
  seo: {
    keywords: [String]
  },
  experiences: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Experience'
  }],
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  blogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }],
  subdomain: {
    type: String,
    required: true,
    unique: true
  },
  customSubdomain: {
    type: String,
    unique: true,
    sparse: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);