const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Lead = require('../models/Lead');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   POST /api/leads
// @desc    Create a new lead
// @access  Private
router.post('/', [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('source').isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'])
    .withMessage('Invalid source'),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'lost', 'won'])
    .withMessage('Invalid status'),
  body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('lead_value').isFloat({ min: 0 }).withMessage('Lead value must be positive'),
  body('is_qualified').optional().isBoolean().withMessage('is_qualified must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const leadData = {
      ...req.body,
      user: req.user._id
    };

    const lead = new Lead(leadData);
    await lead.save();

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Lead with this email already exists'
      });
    }
    console.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating lead'
    });
  }
});

// @route   GET /api/leads
// @desc    Get leads with pagination and filtering
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('score_gt').optional().isInt({ min: 0, max: 100 }).withMessage('score_gt must be between 0 and 100'),
  query('score_lt').optional().isInt({ min: 0, max: 100 }).withMessage('score_lt must be between 0 and 100'),
  query('lead_value_gt').optional().isFloat({ min: 0 }).withMessage('lead_value_gt must be positive'),
  query('lead_value_lt').optional().isFloat({ min: 0 }).withMessage('lead_value_lt must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { user: req.user._id };

    // String filters (equals, contains)
    if (req.query.email) {
      if (req.query.email_operator === 'contains') {
        filter.email = { $regex: req.query.email, $options: 'i' };
      } else {
        filter.email = req.query.email;
      }
    }

    if (req.query.company) {
      if (req.query.company_operator === 'contains') {
        filter.company = { $regex: req.query.company, $options: 'i' };
      } else {
        filter.company = req.query.company;
      }
    }

    if (req.query.city) {
      if (req.query.city_operator === 'contains') {
        filter.city = { $regex: req.query.city, $options: 'i' };
      } else {
        filter.city = req.query.city;
      }
    }

    // Enum filters (equals, in)
    if (req.query.status) {
      if (req.query.status_operator === 'in') {
        filter.status = { $in: req.query.status.split(',') };
      } else {
        filter.status = req.query.status;
      }
    }

    if (req.query.source) {
      if (req.query.source_operator === 'in') {
        filter.source = { $in: req.query.source.split(',') };
      } else {
        filter.source = req.query.source;
      }
    }

    // Number filters (equals, gt, lt, between)
    if (req.query.score !== undefined) {
      filter.score = parseInt(req.query.score);
    }
    if (req.query.score_gt !== undefined) {
      filter.score = { ...filter.score, $gt: parseInt(req.query.score_gt) };
    }
    if (req.query.score_lt !== undefined) {
      filter.score = { ...filter.score, $lt: parseInt(req.query.score_lt) };
    }

    if (req.query.lead_value !== undefined) {
      filter.lead_value = parseFloat(req.query.lead_value);
    }
    if (req.query.lead_value_gt !== undefined) {
      filter.lead_value = { ...filter.lead_value, $gt: parseFloat(req.query.lead_value_gt) };
    }
    if (req.query.lead_value_lt !== undefined) {
      filter.lead_value = { ...filter.lead_value, $lt: parseFloat(req.query.lead_value_lt) };
    }

    // Date filters (on, before, after, between)
    if (req.query.created_at_on) {
      const date = new Date(req.query.created_at_on);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      filter.created_at = { $gte: date, $lt: nextDay };
    }
    if (req.query.created_at_after) {
      filter.created_at = { ...filter.created_at, $gt: new Date(req.query.created_at_after) };
    }
    if (req.query.created_at_before) {
      filter.created_at = { ...filter.created_at, $lt: new Date(req.query.created_at_before) };
    }

    // Boolean filters
    if (req.query.is_qualified !== undefined) {
      filter.is_qualified = req.query.is_qualified === 'true';
    }

    // Execute query with pagination
    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: leads,
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leads'
    });
  }
});

// @route   GET /api/leads/:id
// @desc    Get single lead
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lead'
    });
  }
});

// @route   PUT /api/leads/:id
// @desc    Update lead
// @access  Private
router.put('/:id', [
  body('first_name').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('company').optional().trim().notEmpty().withMessage('Company cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('source').optional().isIn(['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'])
    .withMessage('Invalid source'),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'lost', 'won'])
    .withMessage('Invalid status'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100'),
  body('lead_value').optional().isFloat({ min: 0 }).withMessage('Lead value must be positive'),
  body('is_qualified').optional().isBoolean().withMessage('is_qualified must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { ...req.body, last_activity_at: new Date() },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Lead with this email already exists'
      });
    }
    console.error('Update lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating lead'
    });
  }
});

// @route   DELETE /api/leads/:id
// @desc    Delete lead
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting lead'
    });
  }
});

module.exports = router;
