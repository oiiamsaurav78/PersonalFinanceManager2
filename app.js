const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const categoryRoutes = require("./routes/categories");
const reportsRoutes = require("./routes/reports");
const savingsGoalsRoutes = require("./routes/savingsGoals"); // Correct route for savingsGoals
const Transaction = require("./models/Transaction");
const Category = require("./models/Category");

const app = express();

// Database Connection
mongoose
  .connect("mongodb://localhost:27017/financeManager", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: "mongodb://localhost:27017/financeManager" }),
  })
);

// Routes
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/categories", categoryRoutes);
app.use("/savingsgoals", savingsGoalsRoutes); // Matches /savingsgoals route correctly
app.use("/reports", reportsRoutes);

// Home Page
app.get("/", (req, res) => res.render("index"));

 // Ensure User model is imported
const User = require("./models/User");

// Dashboard Route
app.get("/dashboard", async (req, res) => {
  if (!req.session.userId) return res.redirect("/auth/login");

  try {
    // Fetch the actual user data based on the session's userId
    const user = await User.findById(req.session.userId); 

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Fetch the user's transactions and categories
    const transactions = await Transaction.find({ user: req.session.userId });
    const categories = await Category.find({ user: req.session.userId });

    // Calculate the total income and expenses
    const totalIncome = transactions.filter((t) => t.category === "Income").reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter((t) => t.category !== "Income").reduce((sum, t) => sum + t.amount, 0);

    // Render the dashboard with the actual user data
    res.render("dashboard", {
      user: { name: user.name }, 
      transactions,
      categories,
      totalIncome,
      totalExpenses,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).send("Internal Server Error");
  }
});


// Start the Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
