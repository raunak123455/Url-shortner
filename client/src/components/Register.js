import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    setApiError("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = "Name is required";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    if (validateForm()) {
      try {
        setLoading(true);
        setApiError("");
        console.log("Sending registration request with data:", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        const response = await axios.post(
          "https://url-shortner-t72a.onrender.com/api/auth/register",
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }
        );

        console.log("Registration response:", response.data);

        // Store token in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        navigate("/login");
      } catch (error) {
        console.error("Registration error:", error);
        setLoading(false);
        if (error.response) {
          console.error("Error response:", error.response.data);
          setApiError(error.response.data.error || "Registration failed");
        } else if (error.request) {
          console.error("No response received:", error.request);
          setApiError("No response from server. Please try again.");
        } else {
          console.error("Error setting up request:", error.message);
          setApiError("Network error. Please try again.");
        }
      }
    } else {
      console.log("Form validation failed");
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-container">
        <h2>Create Account</h2>
        <p className="subtitle">Join us to start shortening your URLs</p>

        {apiError && <div className="api-error">{apiError}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.name ? "error" : ""}
              disabled={loading}
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? "error" : ""}
              disabled={loading}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? "error" : ""}
              disabled={loading}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            <div className="button-content">
              {loading && <div className="spinner"></div>}
              {loading ? "Creating Account..." : "Create Account"}
            </div>
          </button>
        </form>

        <div className="login-link">
          Already have an account? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
