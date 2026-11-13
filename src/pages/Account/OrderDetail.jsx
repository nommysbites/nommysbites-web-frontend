import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AccountGuard from "../../components/AccountGuard";
import "./Account.css";

function getDeliveryTag(order) {
  if (order?.orderType === "giftbox") {
    return { label: "Gift", className: "tag-gift" };
  }
  if (order?.fulfillment === "pickup") {
    return { label: "Pick-Up", className: "tag-pickup" };
  }
  return { label: "Delivery", className: "tag-delivery" };
}

function OrderDetailContent() {
  const { orderId } = useParams();
  const { getOrderById } = useAuth();
  const order = getOrderById(orderId);

  if (!order) {
    return (
      <div className="account-page">
        <div className="account-container">
          <div className="account-empty-state">
            <h2 className="account-empty-title">Order Not Found</h2>
            <p className="account-empty-subtitle">
              We couldn&apos;t find an order with the reference #{orderId}.
            </p>
            <Link to="/account/orders" className="btn-account-primary">
              Return to Order History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isGift = order.orderType === "giftbox";
  const deliveryTag = getDeliveryTag(order);
  const whatsappInquiryMessage = encodeURIComponent(
    `Hello Nommy's Bites, I would like to inquire about my order #${order.orderId}.`,
  );
  const whatsappUrl = `https://wa.me/2348105384162?text=${whatsappInquiryMessage}`;

  return (
    <div className="account-page">
      <div className="account-container">
        {/* Back Link */}
        <div className="account-back-wrap">
          <Link to="/account/orders" className="account-back-link">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            <span>Back to Order History</span>
          </Link>
        </div>

        {/* Order Header Directly on the Page */}
        <div className="order-page-header">
          <div className="order-header-main">
            <span className="order-header-eyebrow">ORDER DETAILS</span>
            <h1 className="order-header-title">#{order.orderId}</h1>
            <p className="order-header-date">Placed on {order.date}</p>
          </div>

          <div className="order-header-badges">
            <span className={`order-type-badge ${deliveryTag.className}`}>
              {deliveryTag.label}
            </span>
            <span className="order-status-badge">
              {order.paymentStatus || "Paid via Paystack"}
            </span>
          </div>
        </div>

        {/* Quick Meta Row Directly on the Page */}
        <div className="order-quick-meta-row">
          <div className="order-meta-item">
            <span className="meta-label">Payment</span>
            <strong className="meta-val">
              {order.paymentMethod || "Paystack"}
            </strong>
          </div>

          <div className="order-meta-item">
            <span className="meta-label">Paystack Ref</span>
            <strong className="meta-val font-mono">
              {order.paystackRef || "N/A"}
            </strong>
          </div>

          <div className="order-meta-item">
            <span className="meta-label">Fulfillment</span>
            <strong className="meta-val">
              {order.fulfillment === "pickup"
                ? "Store Pick-up"
                : "Doorstep Delivery"}
            </strong>
          </div>

          <div className="order-meta-item">
            <span className="meta-label">Total Amount</span>
            <strong className="meta-val price-highlight font-mono">
              ₦{(order.grandTotal || 0).toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Details Grid (Customer & Delivery) Directly on the Page */}
        <div className="account-details-grid">
          {/* Customer / Gift Information */}
          <div className="account-section">
            <h2 className="account-section-title">
              {isGift ? "Gift Information" : "Customer Details"}
            </h2>

            {!isGift && order.customer && (
              <div className="account-info-stack">
                <div className="info-stack-row">
                  <span className="info-stack-label">Name</span>
                  <strong className="info-stack-val">
                    {order.customer.firstName} {order.customer.lastName}
                  </strong>
                </div>
                <div className="info-stack-row">
                  <span className="info-stack-label">Email</span>
                  <span className="info-stack-val">{order.customer.email}</span>
                </div>
                <div className="info-stack-row">
                  <span className="info-stack-label">Phone</span>
                  <span className="info-stack-val">{order.customer.phone}</span>
                </div>
              </div>
            )}

            {isGift && (
              <div className="account-info-stack">
                {order.sender && (
                  <div className="gift-party-block">
                    <span className="info-stack-label">Sender</span>
                    <p className="gift-party-text">
                      <strong>
                        {order.sender.firstName} {order.sender.lastName}
                      </strong>
                      <br />
                      {order.sender.email} • {order.sender.phone}
                    </p>
                  </div>
                )}

                {order.receiver && (
                  <div className="gift-party-block">
                    <span className="info-stack-label">Recipient</span>
                    <p className="gift-party-text">
                      <strong>
                        {order.receiver.firstName} {order.receiver.lastName}
                      </strong>
                      <br />
                      {order.receiver.phone}
                      {order.receiver.email ? ` • ${order.receiver.email}` : ""}
                    </p>
                  </div>
                )}

                {order.handwrittenNote && (
                  <div className="gift-party-block">
                    <span className="info-stack-label">Handwritten Note</span>
                    <blockquote className="order-note-quote">
                      &ldquo;{order.handwrittenNote}&rdquo;
                    </blockquote>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fulfillment & Destination */}
          <div className="account-section">
            <h2 className="account-section-title">Fulfillment Details</h2>
            <div className="account-info-stack">
              <div className="info-stack-row">
                <span className="info-stack-label">Mode</span>
                <strong className="info-stack-val">
                  {order.fulfillment === "pickup"
                    ? "Store Pick-up (Pius Alile Shopping Mall, UNIBEN)"
                    : "Address Delivery (Benin City)"}
                </strong>
              </div>

              {order.fulfillment !== "pickup" && (
                <>
                  <div className="info-stack-row">
                    <span className="info-stack-label">Address</span>
                    <span className="info-stack-val">
                      {order.deliveryAddress ||
                        order.coordinates ||
                        "Coordinates pinned on map"}
                    </span>
                  </div>

                  {order.nearestLandmark && (
                    <div className="info-stack-row">
                      <span className="info-stack-label">Landmark</span>
                      <span className="info-stack-val">
                        {order.nearestLandmark}
                      </span>
                    </div>
                  )}

                  {order.coordinates && (
                    <div className="info-stack-row">
                      <span className="info-stack-label">Coordinates</span>
                      <div className="coords-link-group">
                        <span className="info-stack-val font-mono">
                          {order.coordinates}
                        </span>
                        {order.googleMapsUrl && (
                          <a
                            href={order.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="order-maps-link"
                          >
                            <span>Open in Google Maps</span>
                            <svg
                              viewBox="0 0 24 24"
                              width="13"
                              height="13"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {order.distanceKm != null && (
                    <div className="info-stack-row">
                      <span className="info-stack-label">Distance</span>
                      <span className="info-stack-val">
                        {order.distanceKm} km from kitchen
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Section: Items Ordered Directly on the Page */}
        <div className="account-section">
          <h2 className="account-section-title">Items in this Order</h2>

          {/* Desktop Table */}
          <div className="order-items-desktop">
            <div className="items-header-row">
              <span>Product</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Unit Price</span>
              <span className="text-right">Total</span>
            </div>

            <div className="items-body-list">
              {(order.items || []).map((item, idx) => {
                const itemPrice = item.price || 0;
                const itemQty = item.quantity || 1;
                const itemTotal = itemPrice * itemQty;
                const isCustom = item.isCustomPackage || item.box;

                return (
                  <div key={idx} className="item-detail-row">
                    <div className="item-product-col">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="item-product-thumb"
                        />
                      )}
                      <div className="item-product-meta">
                        <strong className="item-product-name">
                          {item.name}
                        </strong>
                        {item.serves && (
                          <span className="item-product-sub">
                            {item.serves}
                          </span>
                        )}

                        {isCustom && item.box && (
                          <div className="custom-box-summary">
                            <span className="custom-box-name">
                              Box: {item.box.name}
                            </span>
                            {item.selectedItems && (
                              <ul className="custom-items-tags">
                                {Object.entries(item.selectedItems)
                                  .filter(([, count]) => count > 0)
                                  .map(([key, count]) => (
                                    <li key={key}>
                                      {count}x {key.replace(/-/g, " ")}
                                    </li>
                                  ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="item-qty-col text-center">{itemQty}</div>

                    <div className="item-price-col text-right font-mono">
                      ₦{itemPrice.toLocaleString()}
                    </div>

                    <div className="item-total-col text-right font-mono font-bold">
                      ₦{itemTotal.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Optimized Cards List */}
          <div className="order-items-mobile">
            {(order.items || []).map((item, idx) => {
              const itemPrice = item.price || 0;
              const itemQty = item.quantity || 1;
              const itemTotal = itemPrice * itemQty;
              const isCustom = item.isCustomPackage || item.box;

              return (
                <div key={idx} className="mobile-item-card">
                  <div className="mobile-item-top">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="mobile-item-img"
                      />
                    )}
                    <div className="mobile-item-meta">
                      <strong className="mobile-item-name">{item.name}</strong>
                      {item.serves && (
                        <span className="mobile-item-serves">
                          {item.serves}
                        </span>
                      )}
                      <div className="mobile-item-pricing">
                        <span>
                          {itemQty} × ₦{itemPrice.toLocaleString()}
                        </span>
                        <strong className="mobile-item-total font-mono">
                          ₦{itemTotal.toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {isCustom && item.box && (
                    <div className="mobile-custom-summary">
                      <span className="mobile-custom-box">
                        Box: {item.box.name}
                      </span>
                      {item.selectedItems && (
                        <ul className="mobile-custom-list">
                          {Object.entries(item.selectedItems)
                            .filter(([, count]) => count > 0)
                            .map(([key, count]) => (
                              <li key={key}>
                                {count}x {key.replace(/-/g, " ")}
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Financial Breakdown Directly on the Page */}
          <div className="order-totals-stack">
            <div className="totals-line">
              <span className="totals-label">Subtotal</span>
              <span className="totals-val font-mono">
                ₦{(order.subtotal || 0).toLocaleString()}
              </span>
            </div>

            {order.deliveryFee != null && (
              <div className="totals-line">
                <span className="totals-label">Delivery Fee</span>
                <span className="totals-val font-mono">
                  {order.deliveryFee === 0
                    ? "Free"
                    : `₦${order.deliveryFee.toLocaleString()}`}
                </span>
              </div>
            )}

            {order.noteFee != null && order.noteFee > 0 && (
              <div className="totals-line">
                <span className="totals-label">Handwritten Note</span>
                <span className="totals-val font-mono">
                  ₦{order.noteFee.toLocaleString()}
                </span>
              </div>
            )}

            <div className="totals-line grand-total">
              <span className="totals-label">Grand Total Paid</span>
              <strong className="totals-val grand-val price-highlight font-mono">
                ₦{(order.grandTotal || 0).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {/* WhatsApp Support Row Directly on the Page */}
        <div className="order-support-row">
          <div className="order-support-text">
            <strong>Need help with this order?</strong>
            <span>Chat directly with our team on WhatsApp.</span>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp-direct"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.12.82.83-3.04-.19-.3a8.163 8.163 0 0 1-1.26-4.46c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.53c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.32z" />
            </svg>
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetail() {
  return (
    <AccountGuard>
      <OrderDetailContent />
    </AccountGuard>
  );
}
