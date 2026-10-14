import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User, Hash } from "lucide-react";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNumber: "",
    branch: "",
    year: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = "Roll number is required";
    }

    if (!formData.branch) {
      newErrors.branch = "Please select your branch";
    }

    if (!formData.year) {
      newErrors.year = "Please select your year";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Backend registration logic will be added here later.
    console.log("Registration form is valid:", formData);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <User size={24} />
          </div>

          <h1 style={styles.title}>Create Account</h1>

          <p style={styles.subtitle}>
            Register for the College Placement System
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={styles.formGroup}>
            <label htmlFor="name" style={styles.label}>
              Full Name
            </label>

            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={{
                  ...styles.input,
                  ...(errors.name ? styles.inputError : {}),
                }}
              />
            </div>

            {errors.name && (
              <p style={styles.error}>{errors.name}</p>
            )}
          </div>

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
                style={{
                  ...styles.input,
                  ...(errors.email ? styles.inputError : {}),
                }}
              />
            </div>

            {errors.email && (
              <p style={styles.error}>{errors.email}</p>
            )}
          </div>

          {/* Roll Number */}
          <div style={styles.formGroup}>
            <label htmlFor="rollNumber" style={styles.label}>
              Roll Number
            </label>

            <div style={styles.inputWrapper}>
              <Hash size={18} style={styles.inputIcon} />

              <input
                id="rollNumber"
                name="rollNumber"
                type="text"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="Enter your roll number"
                style={{
                  ...styles.input,
                  ...(errors.rollNumber ? styles.inputError : {}),
                }}
              />
            </div>

            {errors.rollNumber && (
              <p style={styles.error}>{errors.rollNumber}</p>
            )}
          </div>

          {/* Branch and Year */}
          <div style={styles.row}>
            <div style={styles.halfField}>
              <label htmlFor="branch" style={styles.label}>
                Branch
              </label>

              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  ...(errors.branch ? styles.inputError : {}),
                }}
              >
                <option value="">Select Branch</option>
                <option value="Computer Science">
                  Computer Science
                </option>
                <option value="Information Technology">
                  Information Technology
                </option>
                <option value="Electronics">
                  Electronics
                </option>
                <option value="Mechanical">
                  Mechanical
                </option>
                <option value="Civil">
                  Civil
                </option>
                <option value="Other">Other</option>
              </select>

              {errors.branch && (
                <p style={styles.error}>{errors.branch}</p>
              )}
            </div>

            <div style={styles.halfField}>
              <label htmlFor="year" style={styles.label}>
                Year
              </label>

              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  ...(errors.year ? styles.inputError : {}),
                }}
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>

              {errors.year && (
                <p style={styles.error}>{errors.year}</p>
              )}
            </div>
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
                placeholder="Create a password"
                style={{
                  ...styles.input,
                  paddingRight: "45px",
                  ...(errors.password ? styles.inputError : {}),
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordButton}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {errors.password && (
              <p style={styles.error}>{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirm Password
            </label>

            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />

              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                style={{
                  ...styles.input,
                  paddingRight: "45px",
                  ...(errors.confirmPassword
                    ? styles.inputError
                    : {}),
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                style={styles.passwordButton}
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p style={styles.error}>{errors.confirmPassword}</p>
            )}
          </div>

          {/* Register Button */}
          <button type="submit" style={styles.registerButton}>
            Register
          </button>
        </form>

        {/* Login Link */}
        <div style={styles.loginContainer}>
          <span>Already have an account? </span>

          <Link to="/login" style={styles.loginLink}>
            Login
          </Link>
        </div>
      </div>

      <style>
        {`
          @media (max-width: 600px) {
            .register-card {
              margin: 10px;
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
    maxWidth: "520px",
    padding: "34px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
    boxSizing: "border-box",
  },

  header: {
    textAlign: "center",
    marginBottom: "26px",
  },

  logo: {
    width: "52px",
    height: "52px",
    margin: "0 auto 15px",
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
    margin: "7px 0 0",
    fontSize: "14px",
    color: "#64748b",
  },

  formGroup: {
    marginBottom: "17px",
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
    height: "44px",
    padding: "0 14px 0 42px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    outline: "none",
    fontSize: "14px",
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },

  select: {
    width: "100%",
    height: "44px",
    padding: "0 12px",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    outline: "none",
    fontSize: "14px",
    color: "#334155",
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

  error: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#dc2626",
  },

  row: {
    display: "flex",
    gap: "14px",
    marginBottom: "17px",
  },

  halfField: {
    flex: "1",
    minWidth: "0",
  },

  registerButton: {
    width: "100%",
    height: "46px",
    marginTop: "4px",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },

  loginContainer: {
    marginTop: "22px",
    textAlign: "center",
    fontSize: "14px",
    color: "#64748b",
  },

  loginLink: {
    color: "#2563eb",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default Register;