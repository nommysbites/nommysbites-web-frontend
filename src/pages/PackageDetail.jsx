import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPackageById, packagesData } from "../data/packagesData";
import { useCart } from "../context/CartContext";
import PackageCard from "../components/PackageCard";
import "./PackageDetail.css";

export default function PackageDetail({ mode = "menu" }) {
  const isGift = mode === "gift";
  const { cartItems, addToBag, addToGiftBox } = useCart();
  const { id } = useParams();
  const navigate = useNavigate();
  const pkg = getPackageById(id);

  const isInBag = Boolean(pkg && cartItems?.some((item) => item.id === pkg.id));

  const [quantity, setQuantity] = useState(1);
  const [relatedQuantities, setRelatedQuantities] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [addedGiftSuccess, setAddedGiftSuccess] = useState(false);
  const [prevId, setPrevId] = useState(id);

  // Adjust state during render if ID changes
  if (prevId !== id) {
    setPrevId(id);
    setSelectedImage(null);
    setQuantity(1);
    setRelatedQuantities({});
    setAddedSuccess(false);
    setAddedGiftSuccess(false);
  }

  // Scroll to top on page load or when ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!pkg) {
    return (
      <div className="package-not-found">
        <div className="not-found-card">
          <div className="not-found-icon">🍱</div>
          <h2>Product Not Found</h2>
          <p>
            The product you are looking for does not exist or has been updated.
          </p>
          <Link to="/menu" className="btn-back-menu">
            Explore Full Menu
          </Link>
        </div>
      </div>
    );
  }

  // Related products (same category or others, excluding current)
  const relatedPackages = packagesData
    .filter((p) => p.id !== pkg.id)
    .sort((a, _b) => (a.category === pkg.category ? -1 : 1))
    .slice(0, 4);

  const handleDecreaseQty = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleIncreaseQty = () => {
    setQuantity((q) => q + 1);
  };

  const handleCartAction = () => {
    if (isInBag) {
      navigate("/bag");
      return;
    }
    addToBag(pkg, quantity);
    setQuantity(1);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleAddToGiftBox = () => {
    addToGiftBox(pkg, quantity);
    setQuantity(1);
    setAddedGiftSuccess(true);
    setTimeout(() => setAddedGiftSuccess(false), 2500);
  };

  const handleRelatedQtyChange = (relId, delta) => {
    setRelatedQuantities((prev) => {
      const current = prev[relId] || 1;
      return { ...prev, [relId]: Math.max(1, current + delta) };
    });
  };

  const handleRelatedAdd = (relPkg, qty) => {
    if (isGift) {
      addToGiftBox(relPkg, qty);
    } else {
      addToBag(relPkg, qty);
    }
    setRelatedQuantities((prev) => ({ ...prev, [relPkg.id]: 1 }));
  };

  const displayImage = selectedImage || pkg.largeImage || pkg.image;

  return (
    <div className="package-detail-page">
      <div className="package-detail-container">
        {/* Breadcrumb Navigation */}
        <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb-link">
            Home
          </Link>
          <span className="breadcrumb-sep">/</span>
          <Link to={isGift ? "/gift" : "/menu"} className="breadcrumb-link">
            {isGift ? "Gift" : "Menu"}
          </Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{pkg.name}</span>
        </nav>

        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate(isGift ? "/gift" : "/menu")}
          className="detail-back-btn"
        >
          ← Back to {isGift ? "Gift" : "Menu"}
        </button>

        {/* Main 2-Column Detail Card */}
        <div className="package-detail-card">
          {/* Left Column: Visual Gallery */}
          <div className="detail-visual-col">
            <div className="detail-main-image-wrap">
              <img
                src={displayImage}
                alt={pkg.name}
                className="detail-main-image"
                draggable="false"
              />
              <span className="detail-tag-badge">{pkg.tag}</span>
              <span className="detail-serves-badge">{pkg.serves}</span>
            </div>

            {/* Gallery Thumbnails (if multiple exist) */}
            {pkg.galleryImages && pkg.galleryImages.length > 1 && (
              <div className="detail-thumbnails-row">
                {pkg.galleryImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`detail-thumb-btn ${displayImage === imgUrl ? "active" : ""}`}
                    aria-label={`View image angle ${i + 1}`}
                  >
                    <img src={imgUrl} alt="" className="detail-thumb-img" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information, Items Breakdown & Order Actions */}
          <div className="detail-info-col">
            <div className="detail-category-eyebrow">
              {pkg.categoryLabel} • {pkg.portionSize} Portion
            </div>

            <h1 className="detail-title">{pkg.name}</h1>

            {/* Rating & Social Proof */}
            <div className="detail-meta-row">
              <div className="detail-stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="star-gold">
                    ★
                  </span>
                ))}
                <span className="detail-rating-score">{pkg.rating}</span>
              </div>
              <span className="detail-meta-divider">•</span>
              <span className="detail-orders-count">
                {pkg.reviewCount}+ Happy Foodies
              </span>
              <span className="detail-meta-divider">•</span>
            </div>

            {/* Pricing Area */}
            <div className="detail-price-box">
              <div className="detail-price-numbers">
                <span className="detail-current-price">
                  {pkg.formattedPrice}
                </span>
                {pkg.formattedOriginalPrice && (
                  <span className="detail-original-price">
                    {pkg.formattedOriginalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* "What's Included" */}
            <div className="detail-breakdown-section">
              <h3 className="breakdown-title">
                What&apos;s Included:
              </h3>
              <div className="breakdown-grid">
                {pkg.items && pkg.items.length > 0 ? (
                  pkg.items.map((item, idx) => (
                    <div key={idx} className="breakdown-item-card">
                      <span className="breakdown-item-count">
                        {item.count}x
                      </span>
                      <span className="breakdown-item-name">{item.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="breakdown-fallback">{pkg.shortDescription}</p>
                )}
              </div>
            </div>

            {/* Order Action Row: Quantity + Add to Cart / Go to Cart + Send as a Gift */}
            <div className="detail-order-actions">
              <div className="detail-qty-picker" aria-label="Select quantity">
                <button
                  type="button"
                  onClick={handleDecreaseQty}
                  className="detail-qty-btn"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="detail-qty-number">{quantity}</span>
                <button
                  type="button"
                  onClick={handleIncreaseQty}
                  className="detail-qty-btn"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleCartAction}
                className="detail-add-bag-btn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="btn-icon"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>
                  {addedSuccess
                    ? "✓ Added to Cart!"
                    : isInBag
                    ? "Go to Cart"
                    : "Add to Cart"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleAddToGiftBox}
                className="detail-add-gift-btn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="btn-icon"
                >
                  <rect x="3" y="8" width="18" height="4" rx="1" />
                  <path d="M12 8v13" />
                  <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                  <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                </svg>
                <span>
                  {addedGiftSuccess ? "✓ Added to Gift Box!" : "Send as a Gift"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedPackages.length > 0 && (
          <section
            className="detail-related-section"
            aria-label="Related products"
          >
            <div className="detail-related-header">
              <span className="detail-related-eyebrow">
                MORE DELICIOUS BITES
              </span>
              <h2 className="detail-related-title">You May Also Like</h2>
            </div>

            <div className="detail-related-grid">
              {relatedPackages.map((relPkg) => (
                <PackageCard
                  key={relPkg.id}
                  pkg={relPkg}
                  quantity={relatedQuantities[relPkg.id] || 1}
                  onQuantityChange={handleRelatedQtyChange}
                  onAddToBag={handleRelatedAdd}
                  detailBasePath={isGift ? "/gift" : "/menu"}
                  isGift={isGift}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
