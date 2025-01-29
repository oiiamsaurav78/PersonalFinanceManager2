const express = require("express");
const Transaction = require("../models/Transaction");

const router = express.Router();

router.post("/add", async (req, res) => {
  const { amount, date, category, description } = req.body;
  const transaction = new Transaction({
    user: req.session.userId,
    amount,
    date,
    category,
    description,
  });
  await transaction.save();
  res.redirect("/dashboard");
});

router.get("/delete/:id", async (req, res) => {
    const transactionId = req.params.id; L
  
    try {
      // Check if the user is logged in
      if (!req.session.userId) {
        return res.redirect("/auth/login");
      }
  
      // Find and delete the transaction if it belongs to the logged-in user
      await Transaction.findOneAndDelete({
        _id: transactionId,
        user: req.session.userId, 
      });
  
      // Redirect back to the dashboard
      res.redirect("/dashboard");
    } catch (err) {
      console.error("Error deleting transaction:", err);
      res.status(500).send("Internal Server Error");
    }
  });
  

module.exports = router;
