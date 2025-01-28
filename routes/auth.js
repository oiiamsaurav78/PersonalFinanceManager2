const express = require("express");
const User = require("../models/User"); // Assuming you have a User model for MongoDB
const bcrypt = require("bcrypt"); // For password hashing and comparison
const router = express.Router();

// Render the login page (GET /auth/login)
router.get("/login", (req, res) => {
  res.render("login", { error: null }); // Render login.ejs with no error by default
});

// Handle login form submission (POST /auth/login)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      // If user not found, render login with an error message
      return res.render("login", { error: "User does not exist. Please register first." });
    }

    // Compare the entered password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // If password is incorrect, render login with an error message
      return res.render("login", { error: "Incorrect password. Please try again." });
    }

    // If login is successful, set the session and redirect to the dashboard
    req.session.userId = user._id;
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Render the registration page (GET /auth/register)
router.get("/register", (req, res) => {
  res.render("register", { error: null }); // Render register.ejs with no error by default
});

// Handle registration form submission (POST /auth/register)
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // If the email is already in use, render the registration page with an error message
      return res.render("register", { error: "Email is already registered. Please log in." });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Redirect to the login page after successful registration
    res.redirect("/auth/login");
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Logout Route (GET /auth/logout)
router.get("/logout", (req, res) => {
  if (req.session) {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error logging out:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Redirect to login page after successful logout
      res.redirect("/auth/login");
    });
  } else {
    // If no session exists, redirect to login
    res.redirect("/auth/login");
  }
});

module.exports = router;
