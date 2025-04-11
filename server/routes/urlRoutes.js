const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createShortUrl,
  getUserUrls,
  getUrlAnalytics,
  redirectToUrl,
} = require("../controllers/urlController");

// Protected routes
router.post("/", protect, createShortUrl);
router.get("/", protect, getUserUrls);
router.get("/:id/analytics", protect, getUrlAnalytics);

// Public route for redirection
router.get("/:shortUrl", redirectToUrl);

module.exports = router;
