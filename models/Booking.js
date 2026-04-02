// const mongoose = require('mongoose');

// const bookingSchema = new mongoose.Schema({
//   studentName: { type: String, required: true, trim: true },
//   parentName: { type: String, trim: true },
//   email: { type: String, trim: true, lowercase: true },
//   phone: { type: String, required: true, trim: true },
//   class: { type: String, trim: true },
//   city: { type: String, trim: true },
//   sessionType: {
//     type: String,
//     enum: ['career-counselling', 'parent-session', 'school-workshop', 'other'],
//     default: 'career-counselling'
//   },
//   preferredDate: { type: String },
//   preferredMode: { type: String, enum: ['online', 'offline'], default: 'online' },
//   message: { type: String, trim: true },
//   status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('Booking', bookingSchema);
