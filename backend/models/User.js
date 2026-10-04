const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'employee'], required: true },
    employeeType: {
      type: String,
      enum: ['manager', 'cashier'],
      required: function () {
        return this.role === 'employee';
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);