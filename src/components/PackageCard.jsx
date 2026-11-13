import { useState } from 'react'
import { Link } from 'react-router-dom'
import './PackageCard.css'

export default function PackageCard({
  pkg,
  quantity = 1,
  onQuantityChange,
  onAddToBag,
  detailBasePath = '/menu',
  isGift = false,
}) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const toggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  const handleDecrease = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onQuantityChange) onQuantityChange(pkg.id, -1)
  }

  const handleIncrease = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onQuantityChange) onQuantityChange(pkg.id, 1)
  }

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onAddToBag) {
      onAddToBag(pkg, quantity)
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 1200)
    }
  }

  return (
    <article className="package-card">
      {/* Card Image Wrapper with Link */}
      <Link
        to={`${detailBasePath}/${pkg.id}`}
        className="package-image-link"
        aria-label={`View details of ${pkg.name}`}
      >
        <div className="package-image-wrapper">
          <img
            src={pkg.image}
            alt={pkg.name}
            className="package-image"
            loading="lazy"
            draggable="false"
          />
          {pkg.tag && <span className="package-tag-badge">{pkg.tag}</span>}
          {pkg.serves && (
            <span className="package-serves-badge">{pkg.serves}</span>
          )}

          {/* Favorite Heart Button */}
          <button
            type="button"
            className={`package-favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
            aria-label={
              isFavorite
                ? `Remove ${pkg.name} from favorites`
                : `Add ${pkg.name} to favorites`
            }
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill={isFavorite ? '#e59d0b' : 'none'}
              stroke={isFavorite ? '#e59d0b' : '#451d05'}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>
        </div>
      </Link>

      {/* Card Content */}
      <div className="package-card-body">
        <Link to={`${detailBasePath}/${pkg.id}`} className="package-title-link">
          <h3 className="package-card-title">{pkg.name}</h3>
        </Link>

        {pkg.shortDescription && (
          <p className="package-card-desc" title={pkg.shortDescription}>
            {pkg.shortDescription}
          </p>
        )}

        {/* Card Footer: Price & Actions (Quantity + Add) */}
        <div className="package-card-footer">
          <div className="package-price-wrap">
            <span className="package-card-price">{pkg.formattedPrice}</span>
            {pkg.formattedOriginalPrice && (
              <span className="package-card-original-price">
                {pkg.formattedOriginalPrice}
              </span>
            )}
          </div>

          <div className="package-action-row">
            {/* Quantity Selector */}
            <div
              className="card-qty-selector"
              aria-label={`Select quantity for ${pkg.name}`}
            >
              <button
                type="button"
                className="card-qty-btn"
                onClick={handleDecrease}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="card-qty-num">{quantity}</span>
              <button
                type="button"
                className="card-qty-btn"
                onClick={handleIncrease}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Add Button */}
            <button
              type="button"
              className={`package-add-btn ${justAdded ? 'added' : ''}`}
              onClick={handleAdd}
              aria-label={`Add ${pkg.name} to ${isGift ? 'gift box' : 'bag'}`}
            >
              {justAdded ? (
                <span>Added ✓</span>
              ) : (
                <>
                  {isGift ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="add-cart-icon"
                    >
                      <rect x="3" y="8" width="18" height="4" rx="1" />
                      <path d="M12 8v13" />
                      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="add-cart-icon"
                    >
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                      <path d="M3 6h18" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  )}
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

