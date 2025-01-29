const express = require('express');
const SavingsGoal = require('../models/SavingsGoal');
const Transaction = require('../models/Transaction');
const router = express.Router();

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  res.redirect('/auth/login');
}

// Get all savings goals with calculated progress
router.get('/', isAuthenticated, async (req, res) => {
  try {
   
    const savingsGoals = await SavingsGoal.find({ user: req.session.userId });

    
    for (const goal of savingsGoals) {
      // If the goal is newly created and its progress is still 0, we skip the transaction calculation
      if (goal.progress === 0) {
        continue;
      }

      // Fetch all income transactions linked to the user for this specific goal
      const transactions = await Transaction.find({
        user: req.session.userId,
        amount: { $gt: 0 }, // Only consider income transactions
        date: { $lte: goal.targetDate }, 
      });

      // Calculate total income for this goal (sum of all income transactions)
      const totalSavings = transactions.reduce((sum, tx) => sum + tx.amount, 0);

      
      goal.progress = totalSavings;

      
      if (goal.progress > goal.targetAmount) {
        goal.progress = goal.targetAmount; 
      }

      await goal.save(); 
    }

    // Render the savingsGoals page, passing the goals to the view
    res.render('savingsGoals', { savingsGoals });
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Add a new savings goal
router.post('/add', isAuthenticated, async (req, res) => {
  const { title, targetAmount, targetDate } = req.body;

  try {
    
    const newGoal = new SavingsGoal({
      user: req.session.userId,
      title,
      targetAmount,
      targetDate,
      progress: 0, 
    });

    await newGoal.save(); // Save the new goal to the database
    res.redirect('/savingsgoals'); // Redirect to the savings goals page
  } catch (error) {
    console.error('Error adding savings goal:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Update a savings goal's progress
router.post('/update/:id', isAuthenticated, async (req, res) => {
  const goalId = req.params.id;  
  const { progress } = req.body; // Get the progress value from the form

  try {
    // Find the goal by ID and update its progress
    const goal = await SavingsGoal.findById(goalId);

    if (!goal) {
      return res.status(404).send('Goal not found');
    }

    // Add the new progress to the existing progress (ensure it doesn't exceed targetAmount)
    goal.progress += Number(progress);

    // Optionally, ensure progress doesn't exceed targetAmount
    if (goal.progress > goal.targetAmount) {
      goal.progress = goal.targetAmount; 
    }

    await goal.save(); // Save the updated goal

    // Fetch updated savings goals data and render the page again
    const savingsGoals = await SavingsGoal.find({ user: req.session.userId });

    
    res.render('savingsGoals', { savingsGoals });

  } catch (error) {
    console.error('Error updating savings goal:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Delete a savings goal
router.post('/delete/:id', isAuthenticated, async (req, res) => {
  const goalId = req.params.id;  

  try {
  
    const goal = await SavingsGoal.findByIdAndDelete(goalId);

    if (!goal) {
      return res.status(404).send('Goal not found');
    }

   
    res.redirect('/savingsgoals');
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
