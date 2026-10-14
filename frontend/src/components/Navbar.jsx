import React from "react";
import {
  Home,
  Building2,
  BriefcaseBusiness,
  FileText,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    {
      name: "Dashboard",
      path: "/student/dashboard",
      icon: <Home size={18} />,
    },
    {
      name: "Companies",
      path: "/companies",
      icon: <Building2 size={18} />,
    },
    {
      name: "Placement Drives",
      path: "/placement-drives",
      icon: <BriefcaseBusiness size={18} />,
    },
    {
      name: "Applications",
      path: "/applications",
      icon: <FileText size={18} />,
    },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Project Name */}
        <a href="/student/dashboard" className="navbar-logo">
          College Placement System
        </a>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          {navItems.map((item) => (
            <a key={item.path} href={item.path} className="nav-link">
              {item.icon}
              <span>{item.name}</span>
            </a>
          ))}
        </div>

        {/* Profile Area */}
        <div className="navbar-profile">
          <a href="/student/profile" className="profile-link">
            <div className="profile-icon">
              <User size={18} />
            </div>

            <span className="profile-name">Student</span>
          </a>

          {/* Logout Button */}
          <button
            type="button"
            className="logout-button"
            onClick={() => {
              // Logout logic will be added later.
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="mobile-menu">
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className="mobile-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </a>
          ))}

          <a
            href="/student/profile"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            <User size={18} />
            <span>Profile</span>
          </a>

          <button
            type="button"
            className="mobile-logout-button"
            onClick={() => {
              // Logout logic will be added later.
              setMenuOpen(false);
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;