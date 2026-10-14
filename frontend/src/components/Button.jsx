import React from "react";

function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
}) {
  const baseStyles = {
    padding: "10px 18px",
    borderRadius: "6px",
    border: "1px solid transparent",
    fontSize: "14px",
    fontWeight: "600",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: disabled ? 0.6 : 1,
  };

  const variantStyles = {
    primary: {
      backgroundColor: "#2563eb",
      color: "#ffffff",
      borderColor: "#2563eb",
    },

    secondary: {
      backgroundColor: "#64748b",
      color: "#ffffff",
      borderColor: "#64748b",
    },

    danger: {
      backgroundColor: "#dc2626",
      color: "#ffffff",
      borderColor: "#dc2626",
    },

    outline: {
      backgroundColor: "transparent",
      color: "#2563eb",
      borderColor: "#2563eb",
    },
  };

  const buttonStyle = {
    ...baseStyles,
    ...(variantStyles[variant] || variantStyles.primary),
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
    >
      {children}
    </button>
  );
}

export default Button;