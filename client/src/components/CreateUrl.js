import React, { useState } from "react";
import axios from "axios";
import "./CreateUrl.css";

const CreateUrl = () => {
  const [formData, setFormData] = useState({
    longUrl: "",
    alias: "",
    expirationDate: "",
  });
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/urls",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShortUrl(`http://localhost:5000/${response.data.data.shortUrl}`);
      setFormData({
        longUrl: "",
        alias: "",
        expirationDate: "",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
  };

  return (
    <div className="create-url-container">
      <div className="create-url-form">
        <h2>Create Short URL</h2>
        {error && <div className="error-message">{error}</div>}
        {shortUrl && (
          <div className="short-url-container">
            <p>Your short URL:</p>
            <div className="short-url">
              <input type="text" value={shortUrl} readOnly />
              <button onClick={copyToClipboard}>Copy</button>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="longUrl">Long URL</label>
            <input
              type="url"
              id="longUrl"
              name="longUrl"
              value={formData.longUrl}
              onChange={handleChange}
              placeholder="Enter the URL to shorten"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="alias">Custom Alias (Optional)</label>
            <input
              type="text"
              id="alias"
              name="alias"
              value={formData.alias}
              onChange={handleChange}
              placeholder="Enter custom alias"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="expirationDate">Expiration Date (Optional)</label>
            <input
              type="datetime-local"
              id="expirationDate"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Short URL"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUrl;
