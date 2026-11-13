import { Link } from 'react-router-dom'
import logo from '../assets/logo1.webp'
import './Footer.css'

const CURRENT_YEAR = 2026

export default function Footer() {
  return (
    <footer className="site-footer" id="footer" role="contentinfo" aria-label="Site Footer">
      <div className="footer-top-accent" />

      <div className="footer-container">
        {/* Main Footer Grid */}
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col footer-col-brand">
            <Link to="/" className="footer-brand" aria-label="Nommy's Bites Home">
              <img
                src={logo}
                alt="Nommy's Bites"
                className="footer-logo"
                draggable="false"
              />
            </Link>
            <p className="footer-brand-desc">
              Small chops, pastries, gift boxes, and event catering in Benin City.
            </p>

            {/* Social Links */}
            <div className="footer-social-links" aria-label="Social media links">
              <a
                href="https://www.instagram.com/nommysbites?dlrf=cmdhaWRtbXRwbWY1"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              <a
                href="https://www.facebook.com/share/1d8GojkcZt/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              <a
                href="https://tiktok.com/@nommysbites"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>

              <a
                href="https://wa.me/2348105384162?text=Hello%20Nommy%27s%20Bites!"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-col">
            <h4 className="footer-col-title">Explore</h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="footer-link">
                  Full Menu
                </Link>
              </li>
              <li>
                <Link to="/gift" className="footer-link">
                  Gift Items
                </Link>
              </li>
              <li>
                <Link to="/custom-package" className="footer-link">
                  Custom Packages
                </Link>
              </li>
              <li>
                <Link to="/bag" className="footer-link">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link to="/giftbox" className="footer-link">
                  Gift Box
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="/#outlet" className="footer-link">
                  UNIBEN Campus Outlet
                </a>
              </li>
              <li>
                <a href="/#events" className="footer-link">
                  Event Catering
                </a>
              </li>
            </ul>
          </div>

          {/* Specialties Column */}
          <div className="footer-col">
            <h4 className="footer-col-title">Specialties</h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/menu?category=Party%20Platters" className="footer-link">
                  Party Platters
                </Link>
              </li>
              <li>
                <Link to="/menu" className="footer-link">
                  Crispy Samosas &amp; Spring Rolls
                </Link>
              </li>
              <li>
                <Link to="/menu" className="footer-link">
                  Golden Puff Puff &amp; Pastries
                </Link>
              </li>
              <li>
                <Link to="/menu" className="footer-link">
                  Gourmet Meat Bites &amp; Skewers
                </Link>
              </li>
              <li>
                <a href="/#events" className="footer-link">
                  Live Small Chops Stations
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Location Column */}
          <div className="footer-col">
            <h4 className="footer-col-title">Visit &amp; Contact</h4>
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <span className="footer-contact-icon" aria-hidden="true">
                  📍
                </span>
                <span>
                  Pius Alile Shopping Mall, University of Benin, Ugbowo Campus, Benin City, Edo State
                </span>
              </li>
              <li className="footer-contact-item">
                <span className="footer-contact-icon" aria-hidden="true">
                  📞
                </span>
                <a href="tel:+2348105384162" className="footer-contact-link">
                  +234 810 538 4162
                </a>
              </li>
              <li className="footer-contact-item">
                <span className="footer-contact-icon" aria-hidden="true">
                  💬
                </span>
                <a
                  href="https://wa.me/2348105384162?text=Hello%20Nommy%27s%20Bites!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-link"
                >
                  WhatsApp: +234 810 538 4162
                </a>
              </li>
              <li className="footer-contact-item">
                <span className="footer-contact-icon" aria-hidden="true">
                  ✉️
                </span>
                <a href="mailto:orders@nommysbites.com" className="footer-contact-link">
                  orders@nommysbites.com
                </a>
              </li>
              <li className="footer-contact-item">
                <span className="footer-contact-icon" aria-hidden="true">
                  🕒
                </span>
                <span>Mon – Sat: 8:00 AM – 7:30 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {CURRENT_YEAR} Nommy&apos;s Bites. All rights reserved.
          </p>
          <p className="footer-tagline">
            Freshly prepared with love in Benin City, Nigeria.
          </p>
        </div>
      </div>
    </footer>
  )
}
