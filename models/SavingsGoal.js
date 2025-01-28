const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  targetDate: { type: Date, required: true },
  progress: { type: Number, default: 0 }, // Ensure this is set to 0 initially
});

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
