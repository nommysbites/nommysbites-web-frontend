import { useState } from "react";
import { Link } from "react-router-dom";
import "./Contact.css";

const PHONE_NUMBER_RAW = "2348105384162";
const PHONE_NUMBER_FORMATTED = "+234 810 538 4162";

const socialLinks = [
  {
    name: "WhatsApp",
    handle: "+234 810 538 4162",
    url: `https://wa.me/${PHONE_NUMBER_RAW}?text=${encodeURIComponent(
      "Hello Nommy's Bites! I'm reaching out from your website."
    )}`,
    desc: "Instant chat & order placement",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    handle: "@nommysbites",
    url: "https://www.instagram.com/nommysbites?dlrf=cmdhaWRtbXRwbWY1",
    desc: "Daily fresh chops & BTS stories",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    handle: "@nommysbites",
    url: "https://tiktok.com/@nommysbites",
    desc: "Sizzling food videos & campus vibes",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    handle: "Nommy's Bites",
    url: "https://www.facebook.com/share/1d8GojkcZt/",
    desc: "Catering reviews & event updates",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.message.trim()) {
      return;
    }

    // Compose formatted WhatsApp text
    const text = `Hello Nommy's Bites!\n\nName: ${formData.fullName.trim()}\nMessage: ${formData.message.trim()}`;
    const targetUrl = `https://wa.me/${PHONE_NUMBER_RAW}?text=${encodeURIComponent(text)}`;

    // Open WhatsApp in a new tab
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setFormData({ fullName: "", message: "" });
    setIsSubmitted(false);
  };

  return (
    <div className="contact-page" role="main">
      {/* Header Banner */}
      <section className="contact-hero-section">
        <div className="contact-hero-container">
          <nav className="contact-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Contact Us</span>
          </nav>
          <span className="contact-eyebrow">GET IN TOUCH</span>
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-subtitle">
            Have a question about an order, a gift box, or an upcoming event?
            Send us a message below.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="contact-main-section">
        <div className="contact-container">
          <div className="contact-grid">
            {/* Left Column: Contact Form */}
            <div className="contact-form-column">
              <div className="contact-form-card">
                <div className="form-card-header">
                  <span className="form-header-badge">Send a Message</span>
                  <h2 className="form-card-title">Leave Us a Note</h2>
                  <p className="form-card-desc">
                    Send a quick message here and it opens straight in our
                    WhatsApp chat.
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="contact-success-box" role="status">
                    <div className="success-icon" aria-hidden="true">
                      ✓
                    </div>
                    <h3 className="success-title">Message Prepared!</h3>
                    <p className="success-text">
                      Thank you, <strong>{formData.fullName}</strong>! We&apos;ve
                      opened WhatsApp so you can send your note directly to our team.
                      We reply within minutes.
                    </p>
                    <div className="success-actions">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="contact-btn-secondary"
                      >
                        Send Another Message
                      </button>
                      <Link to="/menu" className="contact-btn-primary">
                        Browse Our Menu
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="contact-form" noValidate>
                    {/* Full Name */}
                    <div className="form-group">
                      <label htmlFor="fullName" className="form-label">
                        Full Name <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Osasogie Imasuen"
                        required
                        className="form-input"
                        autoComplete="name"
                      />
                    </div>

                    {/* Message Area */}
                    <div className="form-group">
                      <label htmlFor="message" className="form-label">
                        Your Message <span className="required-star">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us what you'd like to order, ask about our products, or request event catering..."
                        required
                        rows="6"
                        className="form-textarea"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="form-actions">
                      <button
                        type="submit"
                        className="contact-submit-btn"
                        aria-label="Send message directly via WhatsApp"
                      >
                        <span>Send Message</span>
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="btn-arrow-icon"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </button>
                      <span className="form-note">
                        🔒 Fast response guaranteed during operating hours.
                      </span>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Right Column: Phone, Location & Social Links */}
            <div className="contact-info-column">
              {/* Direct Phone & WhatsApp Card */}
              <div className="contact-highlight-card">
                <div className="highlight-icon-wrap" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="26"
                    height="26"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="highlight-content">
                  <span className="highlight-eyebrow">CALLS &amp; WHATSAPP</span>
                  <h3 className="highlight-title">{PHONE_NUMBER_FORMATTED}</h3>
                  <p className="highlight-desc">
                    Reach us directly by phone or WhatsApp during kitchen hours.
                  </p>
                  <div className="highlight-buttons">
                    <a
                      href={`tel:+${PHONE_NUMBER_RAW}`}
                      className="highlight-call-btn"
                      aria-label="Call Nommy's Bites directly"
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
                        aria-hidden="true"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>Call Now</span>
                    </a>
                    <a
                      href={`https://wa.me/${PHONE_NUMBER_RAW}?text=${encodeURIComponent(
                        "Hello Nommy's Bites! I'd like to place an order."
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="highlight-wa-btn"
                      aria-label="Chat with Nommy's Bites on WhatsApp"
                    >
                      <span>WhatsApp Chat</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Physical Location & Hours */}
              <div className="contact-details-card">
                <div className="detail-item">
                  <div className="detail-icon" aria-hidden="true">
                    📍
                  </div>
                  <div className="detail-info">
                    <h4 className="detail-heading">Physical Outlet</h4>
                    <p className="detail-text">
                      Pius Alile Shopping Mall, University of Benin, Ugbowo
                      Campus, Benin City, Edo State.
                    </p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Pius+Alile+Shopping+Mall+University+of+Benin+Ugbowo+Campus+Benin+City"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="detail-link"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                </div>

                <div className="detail-divider" />

                <div className="detail-item">
                  <div className="detail-icon" aria-hidden="true">
                    🕒
                  </div>
                  <div className="detail-info">
                    <h4 className="detail-heading">Opening Hours</h4>
                    <p className="detail-text">
                      Monday – Saturday: <strong>8:00 AM – 7:30 PM</strong>
                      <br />
                      Sundays: Special event catering &amp; pre-booked pick-ups.
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="contact-social-card">
                <h3 className="social-card-title">Follow &amp; Connect</h3>
                <p className="social-card-subtitle">
                  Catch our latest menu drops, exclusive discounts, and behind-the-scenes treats:
                </p>

                <div className="social-links-grid">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-channel-item"
                      aria-label={`${social.name}: ${social.handle}`}
                    >
                      <div className="social-channel-icon">{social.icon}</div>
                      <div className="social-channel-meta">
                        <span className="social-channel-name">
                          {social.name}
                        </span>
                        <span className="social-channel-handle">
                          {social.handle}
                        </span>
                        <span className="social-channel-desc">
                          {social.desc}
                        </span>
                      </div>
                      <span className="social-arrow" aria-hidden="true">
                        →
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

