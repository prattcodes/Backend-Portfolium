const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    portfolioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Portfolio',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a project title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a project description'],
        trim: true
    },
    technologies: [String],
    liveUrl: String,
    repoUrl: String,
    imageId: String,
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
ProjectSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Project', ProjectSchema);