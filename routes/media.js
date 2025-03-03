const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { cloudflare, configureCloudflareImages, configureCloudflareR2 } = require('../config/cloudflare');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @route   POST /api/media/profile-photo
// @desc    Upload profile photo
// @access  Private
router.post('/profile-photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No photo file provided' });
    }

    // Use the specific images token instead of the general API token
    const { accountId, deliveryUrl } = configureCloudflareImages();
    const imagesToken = process.env.CLOUDFLARE_IMAGES_TOKEN;

    // Create form data for Cloudflare API
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Add metadata as a separate field
    if (req.user && req.user.id) {
      form.append('metadata', JSON.stringify({ userId: req.user.id }));
    }

    // Make direct API call to Cloudflare Images
    const axios = require('axios');
    try {
      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${imagesToken}`
          }
        }
      );

      if (response.data && response.data.success) {
        const imageId = response.data.result.id;
        const imageUrl = response.data.result.variants[0];

        // Update user profile with the new image
        const User = require('../models/User');
        await User.findByIdAndUpdate(
          req.user.id,
          {
            profilePhoto: {
              imageId: imageId,
              url: imageUrl
            }
          },
          { new: true }
        );

        res.json({
          success: true,
          data: {
            imageId: imageId,
            url: imageUrl
          }
        });
      } else {
        console.error('Cloudflare API error response:', response.data);
        res.status(500).json({ success: false, error: 'Error uploading profile photo' });
      }
    } catch (axiosError) {
      console.error('Cloudflare API error details:', axiosError.response?.data || 'No response data');

      // Check if this is a permissions issue
      if (axiosError.response?.status === 403) {
        res.status(403).json({
          success: false,
          error: 'Permission denied: Your API token does not have the required permissions for Cloudflare Images'
        });
      } else {
        res.status(500).json({ success: false, error: 'Error uploading profile photo' });
      }
    }
  } catch (err) {
    console.error('Profile photo upload error:', err);
    res.status(500).json({ success: false, error: 'Error uploading profile photo' });
  }
});

// @route   DELETE /api/media/profile-photo/:imageId
// @desc    Delete profile photo
// @access  Private
router.delete('/profile-photo/:imageId', protect, async (req, res) => {
  try {
    const { accountId } = configureCloudflareImages();
    const imagesToken = process.env.CLOUDFLARE_IMAGES_TOKEN;

    // Delete from Cloudflare
    const axios = require('axios');
    await axios.delete(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${req.params.imageId}`,
      {
        headers: {
          'Authorization': `Bearer ${imagesToken}`
        }
      }
    );

    // Update user profile to remove the image reference
    const User = require('../models/User');
    await User.findByIdAndUpdate(
      req.user.id,
      { $unset: { profilePhoto: "" } },
      { new: true }
    );

    res.json({ success: true, data: {} });
  } catch (err) {
    console.error('Error deleting profile photo:', err);
    res.status(500).json({ success: false, error: 'Error deleting profile photo' });
  }
});

// @route   POST /api/media/project/:projectId
// @desc    Upload project image
// @access  Private
router.post('/project/:projectId', protect, upload.single('image'), async (req, res) => {
  try {
    const { accountId, token } = configureCloudflareImages();
    const result = await cloudflare.images.upload({
      accountId,
      token,
      file: req.file.buffer,
      metadata: { userId: req.user.id, projectId: req.params.projectId }
    });
    res.json({ success: true, data: { imageId: result.id, url: result.variants[0] } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error uploading project image' });
  }
});

// @route   DELETE /api/media/project/:projectId/:imageId
// @desc    Delete project image
// @access  Private
router.delete('/project/:projectId/:imageId', protect, async (req, res) => {
  try {
    const { accountId, token } = configureCloudflareImages();
    await cloudflare.images.delete({
      accountId,
      token,
      imageId: req.params.imageId
    });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error deleting project image' });
  }
});

// @route   POST /api/media/resume
// @desc    Upload resume
// @access  Private
router.post('/resume', protect, upload.single('resume'), async (req, res) => {
  try {
    const { endpoint, accessKeyId, secretAccessKey, bucketName } = configureCloudflareR2();

    // Initialize S3 client for R2
    const S3 = require('@aws-sdk/client-s3');
    const s3Client = new S3.S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    const key = `${req.user.id}/resume/${req.file.originalname}`;

    // Upload to R2 using S3 client
    const command = new S3.PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    });

    await s3Client.send(command);

    // Generate temporary URL for the uploaded file
    const getCommand = new S3.GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

    res.json({
      success: true,
      data: {
        key,
        url
      }
    });
  } catch (err) {
    console.error('Resume upload error:', err);
    res.status(500).json({ success: false, error: 'Error uploading resume' });
  }
});

// @route   GET /api/media/resume/:key
// @desc    Get resume download URL
// @access  Private
router.get('/resume/:key', protect, async (req, res) => {
  try {
    const { endpoint, accessKeyId, secretAccessKey, bucketName } = configureCloudflareR2();

    // Initialize S3 client for R2
    const S3 = require('@aws-sdk/client-s3');
    const s3Client = new S3.S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    // Create GetObject command
    const command = new S3.GetObjectCommand({
      Bucket: bucketName,
      Key: req.params.key
    });

    // Generate presigned URL
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    res.json({ success: true, data: { url } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error getting resume URL' });
  }
});

// @route   DELETE /api/media/resume/:key
// @desc    Delete resume
// @access  Private
router.delete('/resume/:key', protect, async (req, res) => {
  try {
    const { endpoint, accessKeyId, secretAccessKey, bucketName } = configureCloudflareR2();

    // Initialize S3 client for R2
    const S3 = require('@aws-sdk/client-s3');
    const s3Client = new S3.S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    // Create DeleteObject command
    const command = new S3.DeleteObjectCommand({
      Bucket: bucketName,
      Key: req.params.key
    });

    await s3Client.send(command);

    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error deleting resume' });
  }
});

// @route   GET /api/media/resume/:userId/resume/:filename
// @desc    Directly serve resume file
// @access  Public
router.get('/resume/:userId/resume/:filename', async (req, res) => {
  try {
    const { endpoint, accessKeyId, secretAccessKey, bucketName } = configureCloudflareR2();
    const { userId, filename } = req.params;

    // Initialize S3 client for R2
    const S3 = require('@aws-sdk/client-s3');
    const s3Client = new S3.S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    const key = `${userId}/resume/${filename}`;

    // Create GetObject command
    const command = new S3.GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    try {
      // Get the file from R2
      const response = await s3Client.send(command);

      // Set appropriate headers
      res.setHeader('Content-Type', response.ContentType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

      // Stream the file to the response
      response.Body.pipe(res);
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return res.status(404).json({ success: false, error: 'Resume file not found' });
      }
      throw error;
    }
  } catch (err) {
    console.error('Error serving resume file:', err);
    res.status(500).json({ success: false, error: 'Error serving resume file' });
  }
});

// @route   GET /api/media/profile-photo
// @desc    Get current user's profile photo
// @access  Private
router.get('/profile-photo', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    if (!user || !user.profilePhoto) {
      return res.status(404).json({ success: false, error: 'No profile photo found' });
    }

    res.json({
      success: true,
      data: user.profilePhoto
    });
  } catch (err) {
    console.error('Error getting profile photo:', err);
    res.status(500).json({ success: false, error: 'Error getting profile photo' });
  }
});

module.exports = router;