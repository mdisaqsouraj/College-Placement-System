import React from "react";

function Card({ children, title, description }) {
  return (
    <div style={styles.card}>
      {(title || description) && (
        <div style={styles.header}>
          {title && <h3 style={styles.title}>{title}</h3>}

          {description && (
            <p style={styles.description}>{description}</p>
          )}
        </div>
      )}

      <div style={styles.content}>{children}</div>
    </div>
  );
}

const styles = {
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
    boxSizing: "border-box",
  },

  header: {
    padding: "18px 20px 12px",
    borderBottom: "1px solid #f1f5f9",
  },

  title: {
    margin: "0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
  },

  description: {
    margin: "6px 0 0",
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#64748b",
  },

  content: {
    padding: "20px",
    color: "#334155",
    boxSizing: "border-box",
  },
};

export default Card;