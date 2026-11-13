import { useState, useEffect } from "react";
import event1 from "../assets/events/1.jpeg";
import event2 from "../assets/events/2.jpeg";
import event3 from "../assets/events/3.jpeg";
import event4 from "../assets/events/4.jpeg";
import "./Events.css";

// Official Nommy's Bites Event Catering photos
const eventSlides = [
  {
    id: 1,
    image: event2,
    title: "Party Tables",
    subtitle: "Full spreads with small chops, drinks, and sweet snacks for large groups",
  },
  {
    id: 2,
    image: event1,
    title: "Small Chops Cups",
    subtitle: "Packed in neat cups for each guest so serving stays easy",
  },
  {
    id: 3,
    image: event3,
    title: "Donut & Snack Stations",
    subtitle: "Tray setups of glazed donuts, pastries, and cold drinks",
  },
  {
    id: 4,
    image: event4,
    title: "Event Cakes",
    subtitle: "Sliced sponge cakes and desserts made ahead for your guests",
  },
];

const eventTypes = [
  "Weddings",
  "Birthdays",
  "Office Events",
  "House Parties",
  "Bridal Showers",
  "End of Year Parties",
];

export default function Events() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);

  // Preload slides into cache
  useEffect(() => {
    eventSlides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  // Auto-advance slideshow with smooth crossfade
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((curr) => {
        setPrevIndex(curr);
        return (curr + 1) % eventSlides.length;
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
    <section className="events-section" id="events" aria-label="Event Catering">
      <div className="events-container">
        <div className="events-grid">
          {/* Left Column: Narrative, Perks & CTA */}
          <div className="events-content">
            <span className="events-eyebrow">CATERING</span>
            <h2 className="events-title">
              Need Small Chops for an Event?
            </h2>
            <p className="events-description">
              We cater weddings, birthdays, and office meetings across Benin
              City. Tell us your date and guest count, and we will take care of
              the food.
            </p>

            {/* Event Type Pills */}
            <div className="events-tags-wrap" aria-label="Events we cater">
              {eventTypes.map((type) => (
                <span key={type} className="event-tag-pill">
                  {type}
                </span>
              ))}
            </div>

            {/* Action Row */}
            <div className="events-action-row">
              <a
                href={`https://wa.me/2348105384162?text=${encodeURIComponent(
                  "Hello Nommy's Bites, I would like to inquire about your event catering services"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="events-cta-btn"
                aria-label="Book event catering with Nommy's Bites via WhatsApp"
              >
                <span>Book Event Catering</span>
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
              </a>
            </div>
          </div>

          {/* Right Column: Fade-In / Fade-Out Slideshow Frame */}
          <div className="events-visual">
            <div className="event-slideshow-card">
              {/* Crossfade Slideshow Viewport */}
              <div className="event-slideshow-viewport">
                {eventSlides.map((slide, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isPrevious = idx === prevIndex;

                  let slideClass = "event-slide";
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
                        className="event-slide-image"
                        loading="lazy"
                        draggable="false"
                      />
                      {/* Gradient Overlay with Slide Caption */}
                      <div className="event-slide-caption">
                        <span className="event-slide-tag">
                          Nommy&apos;s Catering
                        </span>
                        <h3 className="event-slide-title">{slide.title}</h3>
                        <p className="event-slide-sub">{slide.subtitle}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Slide Navigation Indicator Dots */}
              <div
                className="event-slideshow-dots"
                role="tablist"
                aria-label="Event slides navigation"
              >
                {eventSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === currentIndex}
                    aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                    className={`event-dot ${idx === currentIndex ? "active" : ""}`}
                    onClick={() => goToSlide(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
