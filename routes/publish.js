const express = require('express');
const { protect } = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const router = express.Router();

// @route   GET /api/publish/status
// @desc    Get publishing status
// @access  Private
router.get('/status', protect, async (req, res) => {
  const portfolio = await Portfolio.findOne({ userId: req.user.id });
  res.json({
    success: true,
    data: {
      isPublished: portfolio.isPublished,
      subdomain: portfolio.subdomain,
      customSubdomain: portfolio.customSubdomain,
      publishedAt: portfolio.publishedAt
    }
  });
});

// @route   PUT /api/publish/subdomain
// @desc    Update custom subdomain
// @access  Private
router.put('/subdomain', protect, async (req, res) => {
  const { customSubdomain } = req.body;

  // Check if subdomain is already taken
  const existingPortfolio = await Portfolio.findOne({ customSubdomain });
  if (existingPortfolio && existingPortfolio.userId.toString() !== req.user.id) {
    return res.status(400).json({
      success: false,
      error: 'Subdomain is already taken'
    });
  }

  const portfolio = await Portfolio.findOneAndUpdate(
    { userId: req.user.id },
    { customSubdomain },
    { new: true, runValidators: true }
  );

  res.json({ success: true, data: portfolio });
});

// @route   POST /api/publish
// @desc    Publish portfolio
// @access  Private
router.post('/', protect, async (req, res) => {
  const portfolio = await Portfolio.findOneAndUpdate(
    { userId: req.user.id },
    {
      isPublished: true,
      publishedAt: Date.now()
    },
    { new: true }
  );

  res.json({ success: true, data: portfolio });
});

// @route   DELETE /api/publish
// @desc    Unpublish portfolio
// @access  Private
router.delete('/', protect, async (req, res) => {
  const portfolio = await Portfolio.findOneAndUpdate(
    { userId: req.user.id },
    {
      isPublished: false,
      publishedAt: null
    },
    { new: true }
  );

  res.json({ success: true, data: portfolio });
});

module.exports = router;