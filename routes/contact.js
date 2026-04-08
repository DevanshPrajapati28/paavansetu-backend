const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const dns = require('dns');

// ─── SMTP TRANSPORTER ─────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  lookup: (hostname, options, callback) => {
    return dns.lookup(hostname, { family: 4 }, callback); // Force IPv4
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

    // ✅ SEND RESPONSE IMMEDIATELY (VERY IMPORTANT)
    res.status(201).json({
      success: true,
      message: "Thank you! We'll get back to you within 24 hours.",
      data: { name, email, phone, service, message },
    });

    // ─── SEND EMAIL TO ADMIN (NON-BLOCKING) ─────────────────
    transporter.sendMail({
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
    }).catch((err) => {
      console.error('Admin email failed:', err);
    });

    // ─── AUTO-REPLY (NON-BLOCKING) ──────────────────────────
    if (email) {
      transporter.sendMail({
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
      }).catch((err) => {
        console.error('Auto-reply failed:', err);
      });
    }

  } catch (err) {
    console.error('Contact error:', err);

    // ⚠️ Only send response if not already sent
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Server error. Please try again.',
      });
    }
  }
});

// ─── GET (NO DB) ──────────────────────────────────────────
router.get('/', async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'No database connected',
  });
});

module.exports = router;
