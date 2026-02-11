// models/User.js
const mongoose = require('mongoose');

// Define the User schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true, // Ensure emails are unique
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

// Export the mode
module.exports = mongoose.model('User', UserSchema);