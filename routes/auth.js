const express = require('express');
const passport = require('passport');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// @route   GET /api/auth/github
// @desc    Initiate GitHub OAuth flow
// @access  Public
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// @route   GET /api/auth/github/callback
// @desc    GitHub OAuth callback
// @access  Public
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    const token = req.user.getSignedJwtToken();
    res.json({ success: true, token });
  }
);

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth flow
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = req.user.getSignedJwtToken();
    res.json({ success: true, token });
  }
);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Error logging out' });
      }
      res.json({ success: true, data: {} });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error logging out' });
  }
});
// @route   PUT /api/auth/me
// @desc    Update account settings
// @access  Private
router.put('/me', protect, async (req, res) => {
  const { name, email } = req.body;
  res.json({ success: true, data: user });
});

// @route   PUT /api/auth/me
// @desc    Update account settings
// @access  Private
router.put('/me', protect, async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user.id);

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();
  res.json({ success: true, data: user });
});

// @route   DELETE /api/auth/me
// @desc    Delete account
// @access  Private
router.delete('/me', protect, async (req, res) => {
  await User.findByIdAndDelete(req.user.id);
  res.json({ success: true, data: {} });

  await user.save();
  res.json({ success: true, data: user });
});

// @route   DELETE /api/auth/me
// @desc    Delete account
// @access  Private
router.delete('/me', protect, async (req, res) => {
  await User.findByIdAndDelete(req.user.id);
  res.json({ success: true, data: {} });
});

module.exports = router;