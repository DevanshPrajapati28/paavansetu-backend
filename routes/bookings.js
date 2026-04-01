const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST /api/bookings — Create a booking
router.post('/', async (req, res) => {
  try {
    const { studentName, parentName, email, phone, class: cls, city, sessionType, preferredDate, preferredMode, message } = req.body;

    if (!studentName || !phone) {
      return res.status(400).json({ success: false, message: 'Student name and phone are required.' });
    }

    const booking = await Booking.create({
      studentName, parentName, email, phone, class: cls,
      city, sessionType, preferredDate, preferredMode, message,
    });

    res.status(201).json({
      success: true,
      message: 'Booking request received! We\'ll confirm your session within 24 hours.',
      data: { id: booking._id },
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/bookings — Get all bookings (admin)
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/bookings/:id — Update booking status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
