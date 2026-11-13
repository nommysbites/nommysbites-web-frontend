import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import logo1 from "../assets/logo1.webp";
import "./Navbar.css";

export default function Navbar() {
  const { totalItemsCount, totalGiftBoxCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 820) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header">
      <div className="header-accent-bar" />
      <div className="header-container">
        <Link
          to="/"
          onClick={closeMenu}
          className="header-brand"
          aria-label="Nommy's Bites Home"
        >
          <img
            src={logo1}
            alt="Nommy's Bites Logo"
            className="header-logo"
            draggable="false"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav" aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <Link to="/menu" className="nav-link">
                Menu
              </Link>
            </li>
            <li>
              <Link to="/gift" className="nav-link">
                Gift
              </Link>
            </li>
            <li>
              <Link to="/custom-package" className="nav-link">
                Custom Package
              </Link>
            </li>
            <li>
              <Link to="/contact" className="nav-link">
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>

        {/* Actions (User, Gift Box, Cart, Auth, Mobile Toggle) */}
        <div className="header-actions">
          <div className="header-icon-group">
            {/* User Account Button & Dropdown (When Logged In) - Placed close to giftbox */}
            {isAuthenticated && (
              <div className="nav-user-wrapper" ref={userMenuRef}>
                <button
                  type="button"
                  className="cart-button nav-user-btn"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  aria-label="Account menu"
                  aria-haspopup="true"
                  aria-expanded={isUserMenuOpen}
                  title="Account"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="cart-icon nav-user-icon"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="nav-user-dropdown" role="menu">
                    <div className="nav-user-dropdown-header">
                      <span className="nav-user-dropdown-sub">Signed in</span>
                      <strong className="nav-user-dropdown-email">
                        {user?.email || "Account"}
                      </strong>
                    </div>
                    <div className="nav-user-dropdown-divider" />
                    <Link
                      to="/account/checkout-info"
                      className="nav-user-dropdown-item"
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        closeMenu();
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>Checkout Info</span>
                    </Link>
                    <Link
                      to="/account/orders"
                      className="nav-user-dropdown-item"
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        closeMenu();
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                      <span>Order History</span>
                    </Link>
                    <div className="nav-user-dropdown-divider" />
                    <button
                      type="button"
                      className="nav-user-dropdown-item nav-user-logout-btn"
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        closeMenu();
                        logout();
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <Link
              to="/giftbox"
              className="cart-button"
              aria-label={`Gift Box (${totalGiftBoxCount} items)`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cart-icon"
              >
                <rect x="3" y="8" width="18" height="4" rx="1" />
                <path d="M12 8v13" />
                <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
              </svg>
              <span
                className={`cart-badge ${
                  totalGiftBoxCount > 0 ? "has-items" : ""
                }`}
              >
                {totalGiftBoxCount}
              </span>
            </Link>

            <Link
              to="/bag"
              className="cart-button"
              aria-label={`Shopping Bag (${totalItemsCount} items)`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cart-icon"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span
                className={`cart-badge ${
                  totalItemsCount > 0 ? "has-items" : ""
                }`}
              >
                {totalItemsCount}
              </span>
            </Link>
          </div>

          {/* Desktop Auth Buttons (Hidden when logged in) */}
          {!isAuthenticated && (
            <div className="auth-buttons desktop-auth">
              <Link to="/login" className="btn btn-login">
                Log In
              </Link>
              <Link to="/signup" className="btn btn-signup">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className={`mobile-menu-toggle ${isMenuOpen ? "active" : ""}`}
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="toggle-icon"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="toggle-icon"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div className={`mobile-menu ${isMenuOpen ? "open" : ""}`}>
        <nav className="mobile-nav" aria-label="Mobile Navigation">
          <ul className="mobile-nav-links">
            <li>
              <Link
                to="/menu"
                onClick={closeMenu}
                className="mobile-nav-link"
              >
                Menu
              </Link>
            </li>
            <li>
              <Link
                to="/gift"
                onClick={closeMenu}
                className="mobile-nav-link"
              >
                Gift
              </Link>
            </li>
            <li>
              <Link
                to="/custom-package"
                onClick={closeMenu}
                className="mobile-nav-link"
              >
                Custom Package
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                onClick={closeMenu}
                className="mobile-nav-link"
              >
                Contact Us
              </Link>
            </li>
          </ul>

          <div className="mobile-auth-divider" />

          {isAuthenticated ? (
            <div className="mobile-user-section">
              <div className="mobile-user-header">
                <span className="mobile-user-sub">Signed in as</span>
                <strong className="mobile-user-email">
                  {user?.email || "Account"}
                </strong>
              </div>
              <ul className="mobile-nav-links mobile-user-links">
                <li>
                  <Link
                    to="/account/checkout-info"
                    onClick={closeMenu}
                    className="mobile-nav-link"
                  >
                    Checkout Info
                  </Link>
                </li>
                <li>
                  <Link
                    to="/account/orders"
                    onClick={closeMenu}
                    className="mobile-nav-link"
                  >
                    Order History
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      logout();
                    }}
                    className="mobile-nav-link mobile-logout-btn"
                  >
                    Log out
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="mobile-auth-buttons">
              <Link
                to="/login"
                className="btn btn-login mobile-btn"
                onClick={closeMenu}
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="btn btn-signup mobile-btn"
                onClick={closeMenu}
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
