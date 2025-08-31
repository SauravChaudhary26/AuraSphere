const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');


// Contact form endpoint
router.post('/', async (req, res) => {
  try {

    const { name, email, subject, message } = req.body;
    
    // Get client IP address
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    // Create new contact entry
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      ipAddress
    });

    // Save to database
    const savedContact = await contact.save();

    // Optional: Send email notification (you can implement this)
    // await sendEmailNotification(savedContact);

    res.status(201).json({
      message: 'Contact form submitted successfully',
      id: savedContact._id
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    // Handle duplicate email within short time frame (optional)
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'A message from this email was recently submitted. Please wait before sending another.'
      });
    }

    res.status(500).json({
      message: 'Internal server error. Please try again later.'
    });
  }
});

// Get all contacts (admin endpoint)
router.get('/all', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-ipAddress'); // Don't send IP addresses in response

    const total = await Contact.countDocuments();

    res.json({
      contacts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalContacts: total
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      message: 'Error fetching contacts'
    });
  }
});

// Update contact status (admin endpoint)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'responded'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status'
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        message: 'Contact not found'
      });
    }

    res.json({
      message: 'Contact status updated',
      contact
    });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({
      message: 'Error updating contact status'
    });
  }
});

module.exports = router;