import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import gift5 from "../assets/gifts/5.jpeg";
import gift4 from "../assets/gifts/4.jpeg";
import gift2 from "../assets/gifts/2.jpeg";
import gift1 from "../assets/gifts/1.jpeg";
import "./Gifts.css";

const giftSlides = [
  {
    id: 1,
    image: gift5,
    title: "Wrapped With Ribbons",
    subtitle: "Every gift box comes tied up and includes a pack of chin-chin",
  },
  {
    id: 2,
    image: gift4,
    title: "Hot Bites Inside",
    subtitle: "Peppered chicken, samosas, spring rolls, and puff-puff made fresh before dispatch",
  },
  {
    id: 3,
    image: gift2,
    title: "Write a Note",
    subtitle: "Include a handwritten message with your box at no extra cost",
  },
  {
    id: 4,
    image: gift1,
    title: "Across Benin City",
    subtitle: "Sent straight to UNIBEN hostels, offices, or home addresses",
  },
];

const giftPerks = [
  {
    icon: "🎀",
    title: "Satin Ribbons",
    desc: "Every box is tied with ribbons so it is ready to hand over right away.",
  },
  {
    icon: "✍️",
    title: "Your Own Note",
    desc: "Send a free handwritten message, or upload a card design for us to print.",
  },
  {
    icon: "🍗",
    title: "Cooked Fresh",
    desc: "We fry and bake right before the rider leaves, so it arrives warm.",
  },
  {
    icon: "🛵",
    title: "Citywide Dispatch",
    desc: "Delivered to hostels on campus, offices, and homes in Benin City.",
  },
];

export default function Gifts() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);

  // Preload slides into cache
  useEffect(() => {
    giftSlides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  // Auto-advance slideshow with smooth crossfade
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((curr) => {
        setPrevIndex(curr);
        return (curr + 1) % giftSlides.length;
      });
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (idx) => {
    if (idx === currentIndex) return;
    setPrevIndex(currentIndex);
    setCurrentIndex(idx);
  };

  return (
    <section className="gifts-section" id="gifts" aria-label="Gifts and Surprises">
      <div className="gifts-container">
        <div className="gifts-grid">
          {/* First / Left Column: Gift Images Slideshow Frame */}
          <div className="gifts-visual">
            <div className="gift-slideshow-card">
              {/* Crossfade Slideshow Viewport */}
              <div className="gift-slideshow-viewport">
                {giftSlides.map((slide, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isPrevious = idx === prevIndex;

                  let slideClass = "gift-slide";
                  if (isCurrent) {
                    slideClass +=
                      prevIndex !== null
                        ? " slide-current transitioning"
                        : " slide-current";
                  } else if (isPrevious) {
                    slideClass += " slide-previous";
                  }

                  return (
                    <div
                      key={slide.id}
                      className={slideClass}
                      aria-hidden={!isCurrent}
                    >
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="gift-slide-image"
                        loading="lazy"
                        draggable="false"
                      />
                      {/* Gradient Overlay with Slide Caption */}
                      <div className="gift-slide-caption">
                        <span className="gift-slide-tag">
                          Nommy&apos;s Surprises
                        </span>
                        <h3 className="gift-slide-title">{slide.title}</h3>
                        <p className="gift-slide-sub">{slide.subtitle}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Slide Navigation Indicator Dots */}
              <div
                className="gift-slideshow-dots"
                role="tablist"
                aria-label="Gift slides navigation"
              >
                {giftSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === currentIndex}
                    aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                    className={`gift-dot ${idx === currentIndex ? "active" : ""}`}
                    onClick={() => goToSlide(idx)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Second / Right Column: Copy, Features & CTAs */}
          <div className="gifts-content">
            <span className="gifts-eyebrow">GIFT BOXES</span>
            <h2 className="gifts-title">
              Send a Box of Small Chops to Someone
            </h2>
            <p className="gifts-description">
              Birthdays, anniversaries, or a quick thank-you always land better
              with warm food. Pick a box, add a personal note, and we will
              deliver it for you.
            </p>

            {/* Feature Highlights Grid */}
            <div className="gifts-perks-grid">
              {giftPerks.map((perk, i) => (
                <div key={i} className="gifts-perk-card">
                  <span className="gifts-perk-icon" aria-hidden="true">
                    {perk.icon}
                  </span>
                  <div className="gifts-perk-text">
                    <h4 className="gifts-perk-title">{perk.title}</h4>
                    <p className="gifts-perk-desc">{perk.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <div className="gifts-actions-row">
              <Link
                to="/gift"
                className="gifts-primary-btn"
                aria-label="Browse gift items"
              >
                <span>Browse Gift Items</span>
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
