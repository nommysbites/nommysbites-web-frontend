import { Link } from "react-router-dom";
import "./CTA.css";

export default function CTA() {
  return (
    <section className="cta-section" id="contact" aria-label="Call to Action">
      <div className="cta-glow-accent cta-glow-1" aria-hidden="true" />
      <div className="cta-glow-accent cta-glow-2" aria-hidden="true" />

      <div className="cta-container">
        <div className="cta-content">
          <span className="cta-eyebrow">READY TO ORDER?</span>
          <h2 className="cta-title">
            Hungry? Let Us Make Something Fresh.
          </h2>
          <p className="cta-subtitle">
            Pick up at our UNIBEN campus outlet, order delivery across Benin
            City, or message us for an event.
          </p>

          <div className="cta-actions">
            <Link to="/menu" className="cta-btn-primary">
              <span>See Our Menu</span>
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
            </Link>

            <a
              href="https://wa.me/2348105384162?text=Hello%20Nommy%27s%20Bites!%20I%20would%20like%20to%20place%20an%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn-secondary"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Order via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
