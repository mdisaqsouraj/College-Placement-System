import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setError("");
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      const data = response.data;

      if (data.success) {
        const token = data.data.token;
        const user = data.data.user;

        // Store the JWT returned by the backend.
        localStorage.setItem("token", token);

        // Store basic user information for frontend use.
        localStorage.setItem("user", JSON.stringify(user));

        // Navigate to the student dashboard.
        navigate("/student/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data?.message || "Unable to login. Please try again."
        );
      } else if (err.request) {
        setError(
          "Unable to connect to the server. Please check your connection."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <Lock size={24} />
          </div>

          <h1 style={styles.title}>Welcome Back</h1>

          <p style={styles.subtitle}>
            Login to your College Placement System account
          </p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>

            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={loading}
                style={{
                  ...styles.input,
                  ...(fieldErrors.email ? styles.inputError : {}),
                }}
              />
            </div>

            {fieldErrors.email && (
              <p style={styles.fieldError}>{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>

            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                style={{
                  ...styles.input,
                  paddingRight: "45px",
                  ...(fieldErrors.password ? styles.inputError : {}),
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                style={styles.passwordButton}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {fieldErrors.password && (
              <p style={styles.fieldError}>{fieldErrors.password}</p>
            )}
          </div>

          {/* Forgot Password */}
          <div style={styles.forgotContainer}>
            <button
              type="button"
              onClick={() => {
                // Forgot-password API is not available in the provided backend.
              }}
              style={styles.forgotButton}
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.loginButton,
              ...(loading ? styles.loginButtonDisabled : {}),
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={styles.spinner} />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Register */}
        <div style={styles.registerContainer}>
          <span>Don't have an account? </span>

          <Link to="/register" style={styles.registerLink}>
            Register
          </Link>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 600px) {
            .login-card {
              margin: 20px;
            }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
    backgroundColor: "#f1f5f9",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "430px",
    padding: "36px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
    boxSizing: "border-box",
  },

  header: {
    textAlign: "center",
    marginBottom: "28px",
  },

  logo: {
    width: "52px",
    height: "52px",
    margin: "0 auto 16px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    color: "#ffffff",
  },

  title: {
    margin: "0",
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f172a",
  },

  subtitle: {
    margin: "8px 0 0",
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#64748b",
  },

  errorBox: {
    marginBottom: "20px",
    padding: "12px 14px",
    borderRadius: "6px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  formGroup: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
  },

  inputWrapper: {
    position: "relative",
    width: "100%",
  },

  inputIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    pointerEvents: "none",
  },

  input: {
    width: "100%",
    height: "46px",
    padding: "0 14px 0 42px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    outline: "none",
    fontSize: "14px",
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },

  inputError: {
    borderColor: "#ef4444",
  },

  passwordButton: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    color: "#64748b",
    cursor: "pointer",
    padding: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  fieldError: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#dc2626",
  },

  forgotContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "20px",
  },

  forgotButton: {
    border: "none",
    padding: "0",
    background: "transparent",
    color: "#2563eb",
    fontSize: "13px",
    cursor: "pointer",
  },

  loginButton: {
    width: "100%",
    height: "46px",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  loginButtonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  spinner: {
    animation: "spin 1s linear infinite",
  },

  registerContainer: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "14px",
    color: "#64748b",
  },

  registerLink: {
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default Login;