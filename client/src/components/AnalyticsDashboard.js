import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { QRCodeSVG } from "qrcode.react";
import "./AnalyticsDashboard.css";
import { useNavigate } from "react-router-dom";

const COLORS = ["#667eea", "#764ba2", "#FFBB28", "#FF8042"];

const AnalyticsDashboard = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [formData, setFormData] = useState({
    longUrl: "",
    alias: "",
    expirationDate: "",
  });
  const [shortUrl, setShortUrl] = useState("");
  const [createUrlError, setCreateUrlError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(null);
  const [showCopyPopup, setShowCopyPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUrls();
  }, []);

  useEffect(() => {
    if (selectedUrl) {
      fetchAnalytics(selectedUrl);
    }
  }, [selectedUrl]);

  const fetchUrls = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://url-shortner-t72a.onrender.com/api/urls",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
          },
        }
      );
      setUrls(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError("Failed to fetch URLs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      fetchUrls();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchUrls();
  }, [currentPage]);

  const fetchAnalytics = async (urlId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://url-shortner-t72a.onrender.com/api/urls/${urlId}/analytics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAnalytics(response.data.data);
    } catch (err) {
      setError("Failed to fetch analytics");
    }
  };

  const handleCreateUrlChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateUrlSubmit = async (e) => {
    e.preventDefault();
    setCreateUrlError("");
    setCreateLoading(true);

    try {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token);

      if (!token) {
        setCreateUrlError(
          "You must be logged in to create short URLs. Please log in first."
        );
        return;
      }

      const requestData = {
        longUrl: formData.longUrl,
        ...(formData.alias && { alias: formData.alias }),
        ...(formData.expirationDate && {
          expirationDate: formData.expirationDate,
        }),
      };

      console.log("Creating short URL with data:", requestData);
      const response = await axios.post(
        "https://url-shortner-t72a.onrender.com/api/urls",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Server response:", response.data);
      if (response.data.success) {
        setShortUrl(
          `https://url-shortner-t72a.onrender.com/${response.data.data.shortUrl}`
        );
        setFormData({
          longUrl: "",
          alias: "",
          expirationDate: "",
        });
        fetchUrls();
      } else {
        setCreateUrlError(response.data.error || "Failed to create short URL");
      }
    } catch (err) {
      console.error("Error creating short URL:", err);
      if (err.response?.status === 401) {
        setCreateUrlError("Your session has expired. Please log in again.");
        window.location.href = "/login";
      } else {
        setCreateUrlError(
          err.response?.data?.error || "Something went wrong. Please try again."
        );
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setShowCopyPopup(true);
    setTimeout(() => {
      setShowCopyPopup(false);
    }, 2000);
  };

  const toggleQRCode = (urlId) => {
    setShowQRCode(showQRCode === urlId ? null : urlId);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading && !urls.length) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      {showCopyPopup && (
        <div className="copy-popup">URL copied to clipboard!</div>
      )}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>URL Shortener Dashboard</h2>
          <button onClick={handleLogout} className="logout-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
        <p className="subtitle">Manage and analyze your shortened URLs</p>

        <div className="create-url-section">
          <h3>Create New Short URL</h3>
          {createUrlError && (
            <div className="error-message">{createUrlError}</div>
          )}
          {shortUrl && (
            <div className="short-url-container">
              <p>Your short URL:</p>
              <div className="short-url">
                <input type="text" value={shortUrl} readOnly />
                <button onClick={copyToClipboard}>Copy</button>
              </div>
            </div>
          )}
          <form onSubmit={handleCreateUrlSubmit} className="create-url-form">
            <div className="form-group">
              <label htmlFor="longUrl">Long URL</label>
              <input
                type="url"
                id="longUrl"
                name="longUrl"
                value={formData.longUrl}
                onChange={handleCreateUrlChange}
                placeholder="Enter the URL to shorten"
                required
                disabled={createLoading}
                className="create-url-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="alias">Custom Alias (Optional)</label>
              <input
                type="text"
                id="alias"
                name="alias"
                value={formData.alias}
                onChange={handleCreateUrlChange}
                placeholder="Enter custom alias"
                disabled={createLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="expirationDate">Expiration Date (Optional)</label>
              <input
                type="datetime-local"
                id="expirationDate"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleCreateUrlChange}
                disabled={createLoading}
              />
            </div>
            <button
              type="submit"
              disabled={createLoading}
              className="submit-button"
            >
              {createLoading ? "Creating..." : "Create Short URL"}
            </button>
          </form>
        </div>

        <div className="urls-table">
          <div className="table-header">
            <h3>Your URLs</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search URLs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Original URL</th>
                <th>Short URL</th>
                <th>QR Code</th>
                <th>Total Clicks</th>
                <th>Created Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((url) => (
                <React.Fragment key={url._id}>
                  <tr
                    onClick={() => setSelectedUrl(url._id)}
                    className={selectedUrl === url._id ? "selected" : ""}
                  >
                    <td>{url.longUrl}</td>
                    <td>{`https://url-shortner-t72a.onrender.com/${url.shortUrl}`}</td>
                    <td>
                      <button
                        className="qr-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleQRCode(url._id);
                        }}
                      >
                        {showQRCode === url._id ? "Hide QR" : "Show QR"}
                      </button>
                    </td>
                    <td>{url.clicks.length}</td>
                    <td>{new Date(url.createdAt).toLocaleDateString()}</td>
                    <td>
                      {url.expirationDate &&
                      new Date() > new Date(url.expirationDate)
                        ? "Expired"
                        : "Active"}
                    </td>
                  </tr>
                  {showQRCode === url._id && (
                    <tr className="qr-row">
                      <td colSpan="6">
                        <div className="qr-container">
                          <QRCodeSVG
                            id={`qr-${url._id}`}
                            value={`https://url-shortner-t72a.onrender.com/${url.shortUrl}`}
                            size={200}
                            level="H"
                            includeMargin={true}
                          />
                          <button
                            className="download-qr"
                            onClick={() => {
                              const svgElement = document.getElementById(
                                `qr-${url._id}`
                              );
                              if (!svgElement) return;

                              const svgData =
                                new XMLSerializer().serializeToString(
                                  svgElement
                                );
                              const canvas = document.createElement("canvas");
                              const ctx = canvas.getContext("2d");
                              const img = new Image();

                              img.onload = () => {
                                canvas.width = img.width;
                                canvas.height = img.height;
                                ctx.drawImage(img, 0, 0);
                                const pngFile = canvas.toDataURL("image/png");
                                const downloadLink =
                                  document.createElement("a");
                                downloadLink.download = `qr-${url.shortUrl}.png`;
                                downloadLink.href = pngFile;
                                downloadLink.click();
                              };

                              img.src =
                                "data:image/svg+xml;base64," + btoa(svgData);
                            }}
                          >
                            Download QR Code
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </div>

        {analytics && (
          <div className="analytics-charts">
            <h3>Analytics for {analytics.url.shortUrl}</h3>

            <div className="chart-container">
              <h4>Clicks Over Time</h4>
              <LineChart
                width={600}
                height={300}
                data={Object.entries(analytics.analytics.clicksByDate).map(
                  ([date, clicks]) => ({
                    date,
                    clicks,
                  })
                )}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="clicks" stroke="#667eea" />
              </LineChart>
            </div>

            <div className="chart-container">
              <h4>Device Distribution</h4>
              <PieChart width={400} height={300}>
                <Pie
                  data={Object.entries(analytics.analytics.clicksByDevice).map(
                    ([device, clicks]) => ({
                      name: device || "Unknown",
                      value: clicks,
                    })
                  )}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#667eea"
                  dataKey="value"
                >
                  {Object.entries(analytics.analytics.clicksByDevice).map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>

            <div className="chart-container">
              <h4>Browser Distribution</h4>
              <BarChart
                width={600}
                height={300}
                data={Object.entries(analytics.analytics.clicksByBrowser).map(
                  ([browser, clicks]) => ({
                    browser,
                    clicks,
                  })
                )}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="browser" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clicks" fill="#667eea" />
              </BarChart>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
