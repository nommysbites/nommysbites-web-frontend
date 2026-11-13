import { useLocation, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./FloatingCartBar.css";

export default function FloatingCartBar() {
  const {
    totalItemsCount,
    formattedSubtotal,
    totalGiftBoxCount,
    formattedGiftBoxSubtotal,
  } = useCart();
  const location = useLocation();

  const hiddenPaths = ["/bag", "/checkout", "/giftbox", "/giftbox/checkout"];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  // On /gift and /gift/:id, hide the bag bar and only show when Gift Box has items
  const isGiftCatalog =
    location.pathname === "/gift" || location.pathname.startsWith("/gift/");

  const activeCount = isGiftCatalog ? totalGiftBoxCount : totalItemsCount;
  const activeSubtotal = isGiftCatalog
    ? formattedGiftBoxSubtotal
    : formattedSubtotal;

  if (activeCount === 0) {
    return null;
  }

  const itemsText = isGiftCatalog
    ? activeCount === 1
      ? "1 item in gift box"
      : `${activeCount} items in gift box`
    : activeCount === 1
      ? "1 item in bag"
      : `${activeCount} items in bag`;

  const checkoutTarget = isGiftCatalog ? "/giftbox/checkout" : "/checkout";

  return (
    <aside
      className="floating-cart-bar"
      role="region"
      aria-label={isGiftCatalog ? "Gift box summary" : "Shopping bag summary"}
    >
      <div className="floating-cart-inner">
        {/* Left Side: Icon + Count Message */}
        <div className="floating-cart-info">
          <div className="floating-cart-icon-badge" aria-hidden="true">
            {isGiftCatalog ? (
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
              >
                <rect x="3" y="8" width="18" height="4" rx="1" />
                <path d="M12 8v13" />
                <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
              </svg>
            ) : (
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
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            )}
            <span className="floating-cart-count-dot">{activeCount}</span>
          </div>

          <div className="floating-cart-text">
            <span className="floating-cart-label">{itemsText}</span>
            <span className="floating-cart-subtotal">{activeSubtotal}</span>
          </div>
        </div>

        {/* Right Side: Checkout Button */}
        <Link
          to={checkoutTarget}
          className="floating-checkout-btn"
          aria-label="Proceed to checkout"
        >
          <span>Checkout Now</span>
          <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
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
    </aside>
  );
}
