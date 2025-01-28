const express = require("express");
const Category = require("../models/Category"); // Import the Category model
const router = express.Router();

// Route to add a category
router.post("/add", async (req, res) => {
  const { name } = req.body;

  try {
    if (!req.session.userId) {
      return res.redirect("/auth/login");
    }

    const category = new Category({
      user: req.session.userId,
      name,
    });

    await category.save();
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to delete a category
router.get("/delete/:id", async (req, res) => {
  const categoryId = req.params.id;

  try {
    if (!req.session.userId) {
      return res.redirect("/auth/login");
    }

    await Category.findOneAndDelete({
      _id: categoryId,
      user: req.session.userId,
    });

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/initialize", async (req, res) => {
    if (!req.session.userId) {
      return res.redirect("/auth/login");
    }
  
    try {
      // Check if "Income" already exists
      const incomeCategory = await Category.findOne({
        user: req.session.userId,
        name: "Income",
      });
  
      if (!incomeCategory) {
        // Add "Income" category if not found
        await Category.create({
          user: req.session.userId,
          name: "Income",
        });
      }
  
      res.redirect("/dashboard");
    } catch (err) {
      console.error("Error initializing categories:", err);
      res.status(500).send("Internal Server Error");
    }
  });

module.exports = router;
