const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

router.get("/", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/auth/login");
  }

  try {
    const transactions = await Transaction.find({ user: req.session.userId });

    // Filter income transactions and expense transactions
    const incomeTransactions = transactions.filter((t) => t.category === "Income");
    const expenseTransactions = transactions.filter((t) => t.category !== "Income");

    // Calculate total income
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

    
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Calculate remaining balance
    const remainingBalance = totalIncome - totalExpenses;

    // Prepare monthly expenses for the chart
    const monthlyExpenses = {};
    expenseTransactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const month = date.toLocaleString("default", { month: "short" }); 
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + Math.abs(transaction.amount);
    });

   
    res.render("reports", {
      transactions,
      totalIncome,
      totalExpenses,
      remainingBalance,
      monthlyExpenses,
    });
  } catch (err) {
    console.error("Error generating reports:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
