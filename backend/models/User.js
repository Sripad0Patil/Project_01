const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  age: {
    type: Number,
    required: true
  },
  accountType: {
    type: String,
    enum: ['Savings', 'Current', 'Salary'],
    required: true
  },
  bank: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  aadhaarNumber: {
    type: String,
    required: true,
    unique: true
  },
  documents: {
    aadhaarCard: {
      type: String,
      required: true
    },
    panCard: {
      type: String,
      required: true
    },
    photo: {
      type: String,
      required: true
    },
    signature: {
      type: String,
      required: true
    }
  },
  faceVerified: {
    type: Boolean,
    default: false
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'rejected'],
    default: 'pending'
  },
  accountNumber: {
    type: String,
    unique: true
  },
  accountBalance: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate account number before saving
userSchema.pre('save', async function(next) {
  if (!this.accountNumber) {
    // Generate a random 12-digit account number
    const randomNum = Math.floor(100000000000 + Math.random() * 900000000000);
    this.accountNumber = randomNum.toString();
  }
  next();
});

module.exports = mongoose.model('User', userSchema); 