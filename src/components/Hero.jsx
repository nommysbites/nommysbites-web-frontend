import { useState, useEffect } from 'react'
import hero1 from '../assets/hero/hero-1.webp'
import hero2 from '../assets/hero/hero-2.webp'
import hero3 from '../assets/hero/hero-3.webp'
import './Hero.css'

const backgroundImages = [hero1, hero2, hero3]

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState(null)

  // Preload all high-res hero images immediately into browser cache
  useEffect(() => {
    backgroundImages.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

  // Slower transition: displays each dish for 7.5 seconds so customers can take it in
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((curr) => {
        setPrevIndex(curr)
        return (curr + 1) % backgroundImages.length
      })
    }, 7500)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="hero-section" aria-label="Hero Background Slideshow">
      {/* Background Slideshow */}
      <div className="hero-slideshow">
        {backgroundImages.map((img, idx) => {
          const isCurrent = idx === currentIndex
          const isPrevious = idx === prevIndex

          let slideClass = 'hero-bg-slide'
          if (isCurrent) {
            slideClass +=
              prevIndex !== null
                ? ' slide-current transitioning'
                : ' slide-current'
          } else if (isPrevious) {
            slideClass += ' slide-previous'
          }

          return (
            <div key={idx} className={slideClass} aria-hidden={!isCurrent}>
              <img
                src={img}
                alt=""
                className="hero-bg-image"
                draggable="false"
                loading="eager"
              />
            </div>
          )
        })}
      </div>

      {/* Dark Shade Overlay */}
      <div className="hero-dark-overlay" />

      {/* Hero Content (Headline, Subtitle, Order Button) */}
      <div className="hero-content">
        <h1 className="hero-headline">
          Fresh Small Chops and Pastries, Made to Order.
        </h1>
        <p className="hero-subtext">
          Order a box for yourself, send one to a friend, or let us handle the food for your next event in Benin City.
        </p>
        <button
          type="button"
          className="hero-cta-btn"
          onClick={(e) => e.preventDefault()}
          aria-label="Order Now"
        >
          <span>Order Now</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cta-arrow"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  )
}
