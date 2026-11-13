import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { featuredPackages } from "../data/packagesData";
import PackageCard from "./PackageCard";
import "../pages/Bag.css";

/**
 * Shared Bag & Gift Box page view supporting mode="bag" | "giftbox".
 */
export default function CartView({ mode = "bag" }) {
  const isGift = mode === "giftbox";
  const [recQuantities, setRecQuantities] = useState({});
  const {
    cartItems,
    removeFromBag,
    updateQuantity,
    clearBag,
    totalItemsCount,
    formattedSubtotal,
    addToBag,
    giftBoxItems,
    removeFromGiftBox,
    updateGiftBoxQuantity,
    clearGiftBox,
    totalGiftBoxCount,
    formattedGiftBoxSubtotal,
    addToGiftBox,
  } = useCart();

  const items = isGift ? giftBoxItems : cartItems;
  const totalCount = isGift ? totalGiftBoxCount : totalItemsCount;
  const formattedTotal = isGift ? formattedGiftBoxSubtotal : formattedSubtotal;
  const handleRemove = isGift ? removeFromGiftBox : removeFromBag;
  const handleUpdateQty = isGift ? updateGiftBoxQuantity : updateQuantity;
  const handleClear = isGift ? clearGiftBox : clearBag;
  const handleAddItem = (pkg, qty) => {
    if (isGift) {
      addToGiftBox(pkg, qty);
    } else {
      addToBag(pkg, qty);
    }
    setRecQuantities((prev) => ({ ...prev, [pkg.id]: 1 }));
  };

  const handleRecQuantityChange = (id, delta) => {
    setRecQuantities((prev) => {
      const current = prev[id] || 1;
      return { ...prev, [id]: Math.max(1, current + delta) };
    });
  };

  const browsePath = isGift ? "/gift" : "/menu";
  const browseLabel = isGift ? "Gift" : "Menu";
  const pageTitle = isGift ? "Your Gift Box" : "Your Shopping Bag";
  const checkoutPath = isGift ? "/giftbox/checkout" : "/checkout";

  return (
    <div className="bag-page" role="main">
      {/* Top Breadcrumb & Hero */}
      <section className="bag-hero-section">
        <div className="bag-container">
          <nav className="bag-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="breadcrumb-sep">/</span>
            <Link to={browsePath} className="breadcrumb-link">
              {browseLabel}
            </Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{pageTitle}</span>
          </nav>

          <div className="bag-header-row">
            <div>
              <span className="bag-eyebrow">REVIEW ITEMS</span>
              <h1 className="bag-title">{pageTitle}</h1>
            </div>
            {totalCount > 0 && (
              <span className="bag-count-pill">
                {totalCount} {totalCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bag-main-section">
        <div className="bag-container">
          {items.length === 0 ? (
            /* Empty State */
            <div className="bag-empty-state">
              <div className="empty-bag-illustration" aria-hidden="true">
                {isGift ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="empty-bag-icon"
                  >
                    <rect x="3" y="8" width="18" height="4" rx="1" />
                    <path d="M12 8v13" />
                    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="empty-bag-icon"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                )}
              </div>

              <h2 className="empty-bag-title">
                {isGift ? "Your Gift Box is Empty" : "Your Shopping Bag is Empty"}
              </h2>
              <p className="empty-bag-desc">
                {isGift
                  ? "Looks like you haven't added any items to your gift box yet."
                  : "Looks like you haven't added any items to your bag yet."}
              </p>

              <div className="empty-bag-actions">
                <Link to={browsePath} className="empty-bag-btn">
                  <span>
                    {isGift ? "Browse Gift Items" : "Explore Our Menu"}
                  </span>
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

                <Link
                  to="/custom-package"
                  className="empty-bag-btn secondary"
                >
                  <span>Create Custom Package</span>
                </Link>
              </div>

              {/* Recommendations for empty state */}
              <div className="empty-bag-recommendations">
                <h3 className="recommendations-heading">
                  Popular Items You Might Crave
                </h3>
                <div className="recommendations-grid">
                  {featuredPackages.slice(0, 4).map((pkg) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      quantity={recQuantities[pkg.id] || 1}
                      onQuantityChange={handleRecQuantityChange}
                      onAddToBag={handleAddItem}
                      detailBasePath={isGift ? "/gift" : "/menu"}
                      isGift={isGift}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Bag / Gift Box with Items */
            <div className="bag-grid">
              {/* Left Column: Items List */}
              <div className="bag-items-col">
                <div className="bag-items-card">
                  <div className="bag-items-header">
                    <span className="col-header-item">Item Details</span>
                    <span className="col-header-qty">Quantity</span>
                    <span className="col-header-total">Total</span>
                  </div>

                  <ul className="bag-items-list">
                    {items.map((item) => {
                      const itemTotal = item.price * item.quantity;
                      const itemUrl = item.isCustom
                        ? `/custom-package?edit=${encodeURIComponent(
                            item.id
                          )}&target=${isGift ? "giftbox" : "bag"}`
                        : `${browsePath}/${item.id}`;
                      return (
                        <li key={item.id} className="bag-item-row">
                          {/* Image & Title */}
                          <div className="bag-item-product">
                            <Link
                              to={itemUrl}
                              className="bag-item-image-link"
                              aria-label={
                                item.isCustom
                                  ? `Edit ${item.name}`
                                  : `View ${item.name}`
                              }
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="bag-item-image"
                                loading="lazy"
                              />
                            </Link>

                            <div className="bag-item-meta">
                              <Link to={itemUrl} className="bag-item-name">
                                {item.name}
                              </Link>
                              {item.customSummary && (
                                <Link
                                  to={itemUrl}
                                  className="bag-item-custom-summary bag-item-custom-link"
                                >
                                  {item.customSummary}
                                </Link>
                              )}
                              <div className="bag-item-badges">
                                {item.serves && (
                                  <span className="bag-item-badge">
                                    {item.serves}
                                  </span>
                                )}
                                {item.tag && (
                                  <span className="bag-item-badge tag">
                                    {item.tag}
                                  </span>
                                )}
                                {item.isCustom && (
                                  <Link
                                    to={itemUrl}
                                    className="bag-item-edit-link"
                                  >
                                    Edit Box
                                  </Link>
                                )}
                              </div>
                              <span className="bag-item-unit-price">
                                {item.formattedPrice} each
                              </span>
                            </div>
                          </div>

                          {/* Quantity Selector */}
                          <div className="bag-item-qty-wrap">
                            <div className="bag-qty-controller">
                              <button
                                type="button"
                                className="bag-qty-btn"
                                onClick={() =>
                                  handleUpdateQty(item.id, item.quantity - 1)
                                }
                                aria-label={`Decrease quantity of ${item.name}`}
                              >
                                −
                              </button>
                              <span className="bag-qty-value">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                className="bag-qty-btn"
                                onClick={() =>
                                  handleUpdateQty(item.id, item.quantity + 1)
                                }
                                aria-label={`Increase quantity of ${item.name}`}
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              className="bag-remove-btn"
                              onClick={() => handleRemove(item.id)}
                              aria-label={`Remove ${item.name}`}
                            >
                              ✕ Remove
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="bag-item-total-wrap">
                            <span className="bag-line-total">
                              ₦{itemTotal.toLocaleString()}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Actions Footer */}
                  <div className="bag-items-actions-row">
                    <Link to={browsePath} className="bag-continue-link">
                      ← Continue Shopping
                    </Link>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="bag-clear-btn"
                    >
                      {isGift ? "Clear Gift Box" : "Clear Bag"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary Card */}
              <div className="bag-summary-col">
                <div className="bag-summary-card">
                  <div className="summary-card-header">
                    <span className="summary-card-eyebrow">ORDER SUMMARY</span>
                    <h2 className="summary-card-title">Order Total</h2>
                  </div>

                  {/* Price Breakdown */}
                  <div className="summary-breakdown">
                    <div className="breakdown-row">
                      <span className="breakdown-label">
                        Items Subtotal ({totalCount}{" "}
                        {totalCount === 1 ? "item" : "items"})
                      </span>
                      <span className="breakdown-val">{formattedTotal}</span>
                    </div>

                    <div className="breakdown-divider" />

                    <div className="breakdown-row total-row">
                      <span className="total-label">Subtotal</span>
                      <span className="total-val">{formattedTotal}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <div className="summary-actions">
                    <Link
                      to={checkoutPath}
                      className="bag-checkout-btn"
                      aria-label="Proceed to checkout"
                    >
                      <span>Proceed to Checkout</span>
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
                      href="tel:+2348105384162"
                      className="bag-call-btn"
                      aria-label="Call +234 810 538 4162 to order by phone"
                    >
                      <span>Or Call to Order: +234 810 538 4162</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

