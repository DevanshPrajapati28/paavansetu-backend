const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// ─── SMTP TRANSPORTER ─────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password
  },
});

// Verify transporter
transporter.verify((error) => {
  if (error) {
    console.error('SMTP Error:', error);
  } else {
    console.log('SMTP Server is ready');
  }
});

// ─── POST /api/contact ────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    // Validation
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required.',
      });
    }

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address.',
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits.',
      });
    }

    // Save to DB
    const contact = await Contact.create({
      name,
      email,
      phone,
      service,
      message,
    });

    // Send email to YOU
    try {
      await transporter.sendMail({
        from: `"Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `New Contact - ${service || 'General'}`,
        html: `
          <h2>New Contact Submission</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Email:</b> ${email || 'N/A'}</p>
          <p><b>Service:</b> ${service || 'N/A'}</p>
          <p><b>Message:</b> ${message || 'N/A'}</p>
        `,
      });
    } catch (err) {
      console.error('Admin email failed:', err);
    }

    // Auto-reply
    if (email) {
      try {
        await transporter.sendMail({
          from: `"Career Hatch" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "We've received your message ✅",
          html: `
            <p>Hi ${name},</p>
            <p>Thank you for reaching out. We'll get back within 24 hours.</p>
            <br/>
            <p><b>Your Message:</b></p>
            <p>${message || 'N/A'}</p>
            <br/>
            <p>— Career Hatch Team</p>
          `,
        });
      } catch (err) {
        console.error('Auto-reply failed:', err);
      }
    }

    res.status(201).json({
      success: true,
      message: "Thank you! We'll get back to you within 24 hours.",
      data: contact,
    });

  } catch (err) {
    console.error('Contact error:', err);

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.',
    });
  }
});

// ─── GET (ADMIN) ──────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: contacts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;