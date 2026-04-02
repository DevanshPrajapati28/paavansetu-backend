const express = require('express');
const router = express.Router();

// POST /api/bookings — Create a booking
router.post('/', async (req, res) => {
  try {
    const {
      studentName,
      parentName,
      email,
      phone,
      class: cls,
      city,
      sessionType,
      preferredDate,
      preferredMode,
      message
    } = req.body;

    if (!studentName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Student name and phone are required.'
      });
    }

    // ❌ Removed DB save
    // const booking = await Booking.create({...});

    res.status(201).json({
      success: true,
      message: 'Booking request received! We\'ll confirm your session within 24 hours.',
      data: {
        studentName,
        parentName,
        email,
        phone,
        class: cls,
        city,
        sessionType,
        preferredDate,
        preferredMode,
        message
      },
    });

  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// GET /api/bookings — (No DB, so return empty)
router.get('/', async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'No database connected'
  });
});

// PATCH /api/bookings/:id — Not applicable without DB
router.patch('/:id', async (req, res) => {
  res.status(400).json({
    success: false,
    message: 'Update not supported without database'
  });
});

module.exports = router;
