import outletImg from "../assets/outlet.webp";
import "./Outlet.css";

export default function Outlet() {
  const mapsUrl =
    "https://www.google.com/maps/search/?api=1&query=Pius+Alile+Shopping+Mall+University+of+Benin+Ugbowo+Campus+Benin+City";

  return (
    <section
      className="outlet-section"
      id="outlet"
      aria-label="Our Physical Outlet"
    >
      <div className="outlet-container">
        <div className="outlet-grid">
          {/* Visual Column: Physical Outlet Photo */}
          <div className="outlet-visual">
            <div className="outlet-image-card">
              <img
                src={outletImg}
                alt="Nommy's Bites Outlet at Pius Alile Shopping Mall, UNIBEN"
                className="outlet-image"
                loading="lazy"
                draggable="false"
              />

              {/* Status Badge */}
              <div className="outlet-status-badge">
                <span>Open for Walk-Ins &amp; Pick-Up</span>
              </div>

              {/* Campus Location Tag */}
              <div className="outlet-location-overlay">
                <span className="outlet-campus-pill">UNIBEN Ugbowo Campus</span>
                <span className="outlet-overlay-title">
                  Nommy&apos;s Bites Main Outlet
                </span>
              </div>
            </div>
          </div>

          {/* Content Column: Details, Hours & Directions */}
          <div className="outlet-content">
            <span className="outlet-eyebrow">UNIBEN OUTLET</span>
            <h2 className="outlet-title">Visit Our Campus Kitchen</h2>
            <p className="outlet-description">
              You will find us inside Pius Alile Shopping Mall on UNIBEN Ugbowo
              Campus. Walk in for hot puff-puff and meat pies, or pick up an
              order on your way back from class.
            </p>

            {/* Information Cards */}
            <div className="outlet-info-cards">
              {/* Address Card */}
              <div className="outlet-info-card">
                <div className="outlet-info-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="outlet-info-text">
                  <span className="outlet-info-label">Store Location</span>
                  <p className="outlet-info-value">
                    Pius Alile Shopping Mall, University of Benin, Ugbowo
                    Campus, Benin City, Edo State
                  </p>
                </div>
              </div>

              {/* Hours Card */}
              <div className="outlet-info-card">
                <div className="outlet-info-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="outlet-info-text">
                  <span className="outlet-info-label">Operating Hours</span>
                  <p className="outlet-info-value">
                    Monday – Saturday: 8:00 AM – 7:30 PM
                  </p>
                  <span className="outlet-hours-sub">
                    Sundays: Special Event Orders &amp; Pick-ups Only
                  </span>
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="outlet-actions">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="outlet-btn-primary"
                aria-label="Get directions to Nommy's Bites at Pius Alile Shopping Mall on Google Maps"
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
                >
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                <span>Get Directions</span>
              </a>

              <a
                href="#packages"
                className="outlet-btn-secondary"
                aria-label="Explore items for pick-up"
              >
                <span>Order Ahead for Pick-Up</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
