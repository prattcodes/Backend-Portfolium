const express = require('express');
const { protect } = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const Experience = require('../models/Experience');
const Project = require('../models/Project');
const Blog = require('../models/Blog');
const router = express.Router();

// @route   GET /api/portfolio
// @desc    Get user's portfolio data
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.id })
      .populate({
        path: 'experiences',
        options: { sort: { order: 1 } }
      })
      .populate({
        path: 'projects',
        options: { sort: { order: 1 } }
      })
      .populate({
        path: 'blogs',
        options: { sort: { order: 1 } }
      });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found'
      });
    }

    res.json({ success: true, data: portfolio });
  } catch (err) {
    console.error('Error fetching portfolio:', err);
    res.status(500).json({
      success: false,
      error: 'Error fetching portfolio data'
    });
  }
});

// @route   PUT /api/portfolio
// @desc    Update entire portfolio
// @access  Private
router.put('/', protect, async (req, res) => {
  const portfolio = await Portfolio.findOneAndUpdate(
    { userId: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: portfolio });
});

// @route   PATCH /api/portfolio
// @desc    Update specific portfolio sections
// @access  Private
router.patch('/', protect, async (req, res) => {
  const portfolio = await Portfolio.findOneAndUpdate(
    { userId: req.user.id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: portfolio });
});

// Experience Routes
router.get('/experience', protect, async (req, res) => {
  const portfolio = await Portfolio.findOne({ userId: req.user.id });
  const experiences = await Experience.find({ portfolioId: portfolio._id }).sort('order');
  res.json({ success: true, data: experiences });
});

router.post('/experience', protect, async (req, res) => {
  const portfolio = await Portfolio.findOne({ userId: req.user.id });
  const experience = await Experience.create({
    ...req.body,
    portfolioId: portfolio._id
  });

  // Add experience to portfolio's experiences array
  portfolio.experiences.push(experience._id);
  await portfolio.save();

  res.json({ success: true, data: experience });
});

router.put('/experience/:id', protect, async (req, res) => {
  const portfolio = await Portfolio.findOne({ userId: req.user.id });
  const experience = await Experience.findOneAndUpdate(
    { _id: req.params.id, portfolioId: portfolio._id },
    req.body,
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: experience });
});

router.delete('/experience/:id', protect, async (req, res) => {
  const portfolio = await Portfolio.findOne({ userId: req.user.id });
  await Experience.findOneAndDelete({
    _id: req.params.id,
    portfolioId: portfolio._id
  });

  // Remove experience from portfolio's experiences array
  portfolio.experiences = portfolio.experiences.filter(exp => exp.toString() !== req.params.id);
  await portfolio.save();

  res.json({ success: true, data: {} });
});

// Project Routes
router.get('/projects', protect, async (req, res) => {
  const portfolio = await Portfolio.findOne({ userId: req.user.id });
  const projects = await Project.find({ portfolioId: portfolio._id }).sort('order');
  res.json({ success: true, data: projects });
});

router.post('/projects', protect, async (req, res) => {
  const portfolio = await Portfolio.findOne({ userId: req.user.id });
  const project = await Project.create({
    ...req.body,
    portfolioId: portfolio._id
  });

  // Add project to portfolio's projects array
  portfolio.projects.push(project._id);
  await portfolio.save();

  res.json({ success: true, data: project });
});

router.put('/projects/:id', protect, async (req, res) => {
  const portfolio = await Portfolio.findOne({ userId: req.user.id });
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, portfolioId: portfolio._id },
    req.body,
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: project });
});

router.delete('/projects/:id', protect, async (req, res) => {
  const portfolio = await Portfolio.findOne({ userId: req.user.id });
  await Project.findOneAndDelete({
    _id: req.params.id,
    portfolioId: portfolio._id
  });

  // Remove project from portfolio's projects array
  portfolio.projects = portfolio.projects.filter(proj => proj.toString() !== req.params.id);
  await portfolio.save();

  res.json({ success: true, data: {} });
});

// Blog Routes
router.get('/blogs', protect, async (req, res) => {
  const portfolio = await Portfolio.findOne({ userId: req.user.id });
  const blogs = await Blog.find({ portfolioId: portfolio._id }).sort('order');
  res.json({ success: true, data: blogs });
});

// @route   POST /api/portfolio/blogs
// @desc    Add a new blog
// @access  Private
router.post('/blogs', protect, async (req, res) => {
  try {
    const { title, content, description, url, image, portfolioId, order } = req.body;

    // Check if portfolioId is provided
    if (!portfolioId) {
      return res.status(400).json({
        success: false,
        error: 'portfolioId is required'
      });
    }

    // Validate that the portfolio exists and belongs to the user
    const portfolio = await Portfolio.findOne({
      _id: portfolioId,
      userId: req.user.id
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found or you do not have permission'
      });
    }

    // Create the blog
    // Use content if provided, otherwise use description
    const blogContent = content || description || '';

    const blog = await Blog.create({
      title,
      content: blogContent,
      url, // Add url field if your model supports it
      image,
      portfolioId,
      order: order || 0
    });

    res.status(201).json({
      success: true,
      data: blog
    });
  } catch (err) {
    console.error('Error adding blog:', err.message);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   PUT /api/portfolio/blogs/:blogId
// @desc    Update a blog
// @access  Private
router.put('/blogs/:blogId', protect, async (req, res) => {
  try {
    const { title, content, image, order } = req.body;

    // Find the blog by blogId field
    const blog = await Blog.findOne({ blogId: req.params.blogId });

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    // Verify ownership by checking if the portfolio belongs to the user
    const portfolio = await Portfolio.findOne({
      _id: blog.portfolioId,
      userId: req.user.id
    });

    if (!portfolio) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this blog'
      });
    }

    // Update the blog
    const updatedBlog = await Blog.findOneAndUpdate(
      { blogId: req.params.blogId },
      {
        title: title || blog.title,
        content: content || blog.content,
        image: image || blog.image,
        order: order !== undefined ? order : blog.order
      },
      { new: true }
    );

    res.json({
      success: true,
      data: updatedBlog
    });
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   DELETE /api/portfolio/blogs/:blogId
// @desc    Delete a blog
// @access  Private
router.delete('/blogs/:blogId', protect, async (req, res) => {
  try {
    // Find the blog by blogId field
    const blog = await Blog.findOne({ blogId: req.params.blogId });

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    // Verify ownership by checking if the portfolio belongs to the user
    const portfolio = await Portfolio.findOne({
      _id: blog.portfolioId,
      userId: req.user.id
    });

    if (!portfolio) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this blog'
      });
    }

    // Delete the blog
    await Blog.findOneAndDelete({ blogId: req.params.blogId });

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Settings Routes
router.put('/settings', protect, async (req, res) => {
  const portfolio = await Portfolio.findOneAndUpdate(
    { userId: req.user.id },
    { $set: { settings: req.body } },
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: portfolio.settings });
});

module.exports = router;