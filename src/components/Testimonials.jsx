import "./Testimonials.css";

const testimonialsData = [
  {
    id: 1,
    name: "Dr. Osasere I.",
    role: "Faculty Lecturer, UNIBEN",
    tag: "Departmental Symposium",
    rating: 5,
    initials: "OI",
    avatarColor: "linear-gradient(135deg, #f5a623 0%, #c77b00 100%)",
    content:
      "We ordered the Executive Platters for our faculty symposium. The presentation was top-tier, delivered right on time to Pius Alile Mall, and the savory pies were piping hot. My colleagues are still asking for their contact!",
  },
  {
    id: 2,
    name: "Amina & Kelvin B.",
    role: "Wedding Reception Hosts, GRA Benin",
    tag: "Wedding Catering (350 Guests)",
    rating: 5,
    initials: "AB",
    avatarColor: "linear-gradient(135deg, #6e3105 0%, #451d05 100%)",
    content:
      "Nommy's Bites handled our live small chops station for our wedding reception. Watching the samosas and spring rolls fried fresh right at the venue was a huge hit with our guests. Truly unforgettable flavor!",
  },
  {
    id: 3,
    name: "Emeka O.",
    role: "Final Year Student, UNIBEN",
    tag: "Regular Campus Walk-In",
    rating: 5,
    initials: "EO",
    avatarColor: "linear-gradient(135deg, #e59d0b 0%, #d97706 100%)",
    content:
      "Their walk-in outlet at Pius Alile Shopping Mall is a lifesaver between back-to-back lectures. The puff puff is delightfully golden and sweet, the chicken skewers are tender, and the prices are student-friendly.",
  },
];

export default function Testimonials() {
  return (
    <section
      className="testimonials-section"
      id="testimonials"
      aria-label="Customer Testimonials"
    >
      <div className="testimonials-container">
        {/* Section Header */}
        <div className="testimonials-header">
          <span className="testimonials-eyebrow">WHAT OUR CLIENTS SAY</span>
          <h2 className="testimonials-title">
            Loved by Foodies, Students &amp; Event Hosts
          </h2>
          <p className="testimonials-subtitle">
            From quick campus bites at our UNIBEN outlet to grand celebration
            feasts across Benin City, here is what our customers have to say.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="testimonials-grid">
          {testimonialsData.map((item) => (
            <article key={item.id} className="testimonial-card">
              {/* Stars & Quote Header */}
              <div className="testimonial-card-top">
                <div
                  className="testimonial-stars"
                  aria-label={`${item.rating} out of 5 stars`}
                >
                  {[...Array(item.rating)].map((_, i) => (
                    <svg
                      key={i}
                      viewBox="0 0 24 24"
                      className="star-icon"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <blockquote className="testimonial-quote">
                &ldquo;{item.content}&rdquo;
              </blockquote>

              {/* Author Info */}
              <div className="testimonial-author">
                <div
                  className="testimonial-avatar"
                  style={{ background: item.avatarColor }}
                  aria-hidden="true"
                >
                  {item.initials}
                </div>
                <div className="testimonial-author-meta">
                  <div className="testimonial-author-name-row">
                    <h4 className="testimonial-author-name">{item.name}</h4>
                    <span className="verified-badge" title="Verified Customer">
                      ✓
                    </span>
                  </div>
                  <span className="testimonial-author-role">{item.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Social Proof Metric Bar */}
        <div className="testimonials-metric-bar">
          <div className="metric-item">
            <span className="metric-number">4.9 / 5.0</span>
            <span className="metric-label">Average Customer Rating</span>
          </div>
          <div className="metric-divider" aria-hidden="true" />
          <div className="metric-item">
            <span className="metric-number">2,500+</span>
            <span className="metric-label">Bite Boxes Delivered</span>
          </div>
          <div className="metric-divider" aria-hidden="true" />
          <div className="metric-item">
            <span className="metric-number">120+</span>
            <span className="metric-label">Events &amp; Parties Catered</span>
          </div>
        </div>
      </div>
    </section>
  );
}
