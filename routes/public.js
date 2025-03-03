const express = require('express');
const Portfolio = require('../models/Portfolio');
const router = express.Router();

// @route   GET /api/public/:subdomain
// @desc    Get published portfolio by subdomain
// @access  Public
router.get('/:subdomain', async (req, res) => {
    try {
        const { subdomain } = req.params;
        console.log(`Looking for portfolio with subdomain: ${subdomain}`);

        // Find portfolio by subdomain (either custom or default)
        const portfolio = await Portfolio.findOne({
            $or: [
                { subdomain },
                { customSubdomain: subdomain }
            ],
            isPublished: true
        });

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio not found or not published'
            });
        }

        console.log(`Found portfolio ID: ${portfolio._id}`);

        // Find all experiences, projects, and blogs for this portfolio
        const Experience = require('../models/Experience');
        const Project = require('../models/Project');
        const Blog = require('../models/Blog');

        const experiences = await Experience.find({ portfolioId: portfolio._id }).sort('order');
        const projects = await Project.find({ portfolioId: portfolio._id }).sort('order');
        const blogs = await Blog.find({ portfolioId: portfolio._id }).sort('order');

        // Create a complete portfolio object with all related data
        const completePortfolio = portfolio.toObject();
        completePortfolio.experiences = experiences;
        completePortfolio.projects = projects;
        completePortfolio.blogs = blogs;

        res.json({
            success: true,
            data: completePortfolio
        });
    } catch (err) {
        console.error(`Error in GET /api/public/:subdomain: ${err.message}`);
        console.error(err.stack);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: err.message
        });
    }
});

module.exports = router;