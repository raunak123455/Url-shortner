const Url = require("../models/Url");
const shortid = require("shortid");
const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");

// Generate short URL
const generateShortUrl = () => {
  return shortid.generate();
};

// Validate URL format
const isValidUrl = (url) => {
  try {
    // First try to parse the URL
    const parsedUrl = new URL(url);

    // Check if the URL has a valid protocol (http or https)
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return false;
    }

    // Check if the URL has a valid hostname
    if (!parsedUrl.hostname) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};

// @desc    Create short URL
// @route   POST /api/urls
// @access  Private
exports.createShortUrl = async (req, res) => {
  try {
    const { longUrl, alias, expirationDate } = req.body;
    const userId = req.user._id;
    console.log(userId, "userId");

    // Validate URL format
    if (!longUrl) {
      return res.status(400).json({
        success: false,
        error: "Please provide a URL",
      });
    }

    if (!isValidUrl(longUrl)) {
      return res.status(400).json({
        success: false,
        error: "Please provide a valid URL starting with http:// or https://",
      });
    }

    // Validate alias if provided
    if (alias && !/^[a-zA-Z0-9_-]+$/.test(alias)) {
      return res.status(400).json({
        success: false,
        error:
          "Alias can only contain letters, numbers, underscores, and hyphens",
      });
    }

    // Generate short URL or use alias
    const shortUrl = alias || generateShortUrl();

    // Create URL document
    const url = await Url.create({
      longUrl,
      shortUrl,
      alias,
      userId,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
    });

    res.status(201).json({
      success: true,
      data: url,
    });
  } catch (error) {
    console.error("Error creating short URL:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Alias already exists",
      });
    }
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get all URLs for user with pagination and search
// @route   GET /api/urls
// @access  Private
exports.getUserUrls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = {
      userId: req.user._id,
      $or: [
        { longUrl: { $regex: search, $options: "i" } },
        { shortUrl: { $regex: search, $options: "i" } },
        { alias: { $regex: search, $options: "i" } },
      ],
    };

    // Get total count for pagination
    const total = await Url.countDocuments(searchQuery);

    // Get paginated results
    const urls = await Url.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: urls.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: urls,
    });
  } catch (error) {
    console.error("Error fetching URLs:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get URL analytics
// @route   GET /api/urls/:id/analytics
// @access  Private
exports.getUrlAnalytics = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({
        success: false,
        error: "URL not found",
      });
    }

    // Check if user owns the URL
    if (url.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized",
      });
    }

    // Calculate analytics
    const totalClicks = url.clicks.length;
    const clicksByDate = {};
    const clicksByDevice = {};
    const clicksByBrowser = {};
    const clicksByCountry = {};

    url.clicks.forEach((click) => {
      // Clicks by date
      const date = click.timestamp.toISOString().split("T")[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;

      // Clicks by device
      clicksByDevice[click.deviceType] =
        (clicksByDevice[click.deviceType] || 0) + 1;

      // Clicks by browser
      clicksByBrowser[click.browser] =
        (clicksByBrowser[click.browser] || 0) + 1;

      // Clicks by country
      clicksByCountry[click.country] =
        (clicksByCountry[click.country] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        url,
        analytics: {
          totalClicks,
          clicksByDate,
          clicksByDevice,
          clicksByBrowser,
          clicksByCountry,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Redirect to original URL
// @route   GET /:shortUrl
// @access  Public
exports.redirectToUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ shortUrl: req.params.shortUrl });

    if (!url) {
      return res.status(404).json({
        success: false,
        error: "URL not found",
      });
    }

    // Check if URL is expired
    if (url.expirationDate && new Date() > url.expirationDate) {
      return res.status(400).json({
        success: false,
        error: "URL has expired",
      });
    }

    // Get user agent info
    const parser = new UAParser(req.headers["user-agent"]);
    const deviceType = parser.getDevice().type || "desktop";
    const browser = parser.getBrowser().name || "Unknown";

    // Get IP and country
    const ip = req.ip;
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : "Unknown";

    // Add click data
    url.clicks.push({
      ip,
      deviceType,
      browser,
      country,
      referrer: req.headers.referer || "Direct",
    });

    await url.save();

    // Redirect to original URL
    res.redirect(url.longUrl);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
