const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ip: String,
  deviceType: String,
  browser: String,
  country: String,
  referrer: String,
});

const urlSchema = new mongoose.Schema({
  longUrl: {
    type: String,
    required: true,
    trim: true,
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  alias: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  clicks: [clickSchema],
  expirationDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
urlSchema.index({ shortUrl: 1 });
urlSchema.index({ userId: 1 });
urlSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Url", urlSchema);
