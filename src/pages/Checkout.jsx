import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import DeliverySection from "../components/DeliverySection";
import {
  WHATSAPP_PHONE,
  createInitialDeliveryLocation,
  validateDeliveryFields,
  teachAddressStore,
  resolveFinalAddress,
  launchPaystackCheckout,
  formatOrderTimestamp,
} from "../utils/checkoutPaystack";
import "./Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalItemsCount, subtotal, formattedSubtotal, clearBag } =
    useCart();
  const { user, addOrder } = useAuth();

  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    deliveryAddress: user?.deliveryLocation
      ? `${user.deliveryLocation.lat}, ${user.deliveryLocation.lng}`
      : "",
    nearestLandmark: user?.nearestLandmark || "",
  });

  const [fulfillment, setFulfillment] = useState("delivery");
  const [registerAccount, setRegisterAccount] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState(
    () => user?.deliveryLocation || createInitialDeliveryLocation()
  );
  const [isLocationTracked, setIsLocationTracked] = useState(
    Boolean(user?.deliveryLocation)
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const activeDeliveryFee =
    fulfillment === "pickup" || !isLocationTracked
      ? 0
      : deliveryLocation.deliveryFee;
  const grandTotal = subtotal + activeDeliveryFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleLocationSelect = (loc) => {
    setDeliveryLocation(loc);
    setIsLocationTracked(true);
    setFormErrors((prev) => ({
      ...prev,
      mapLocation: null,
      deliveryAddress: null,
    }));
    setFormData((prev) => ({
      ...prev,
      deliveryAddress: `${loc.lat}, ${loc.lng}`,
    }));
  };

  const handleLocationReject = (message) => {
    setIsLocationTracked(false);
    setFormData((prev) => ({
      ...prev,
      deliveryAddress: "",
    }));
    setFormErrors((prev) => ({
      ...prev,
      mapLocation:
        message ||
        "Delivery is available within Benin City only. Please select a location inside Benin City.",
    }));
  };

  const validateForm = () => {
    const errors = {
      ...validateDeliveryFields({
        fulfillment,
        isLocationTracked,
        deliveryLocation,
        deliveryAddress: formData.deliveryAddress,
      }),
    };
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim() || !formData.email.includes("@")) {
      errors.email = "Valid email is required";
    }
    if (!formData.phone.trim() || formData.phone.length < 9) {
      errors.phone = "Valid phone number is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayWithPaystack = (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 250, behavior: "smooth" });
      return;
    }

    setIsProcessing(true);

    const orderId = `NB-${Math.floor(100000 + Math.random() * 900000)}`;
    const { coordinatesText, finalAddress, googleMapsUrl } = resolveFinalAddress(
      {
        fulfillment,
        deliveryLocation,
        nearestLandmark: formData.nearestLandmark,
      }
    );

    teachAddressStore({
      fulfillment,
      nearestLandmark: formData.nearestLandmark,
      deliveryLocation,
    });

    try {
      launchPaystackCheckout({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        grandTotal,
        orderId,
        customFields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: `${formData.firstName} ${formData.lastName}`.trim(),
          },
          {
            display_name: "Phone Number",
            variable_name: "phone_number",
            value: formData.phone.trim(),
          },
          {
            display_name: "Fulfillment",
            variable_name: "fulfillment",
            value:
              fulfillment === "delivery"
                ? "Delivery to Address"
                : "Store Pick-up",
          },
          {
            display_name: "Delivery Address",
            variable_name: "delivery_address",
            value: finalAddress,
          },
          {
            display_name: "Coordinates (Lat, Lng)",
            variable_name: "coordinates",
            value: coordinatesText,
          },
          {
            display_name: "Google Maps Pin",
            variable_name: "google_maps_url",
            value: googleMapsUrl,
          },
          {
            display_name: "Nearest Landmark",
            variable_name: "nearest_landmark",
            value: formData.nearestLandmark.trim() || "N/A",
          },
        ],
        onSuccess: (transaction) => {
          setIsProcessing(false);
          const order = {
            orderId,
            paystackRef: transaction?.reference || orderId,
            date: formatOrderTimestamp(),
            customer: { ...formData, deliveryAddress: finalAddress },
            fulfillment,
            coordinates: coordinatesText,
            googleMapsUrl,
            deliveryFee: activeDeliveryFee,
            distanceKm: deliveryLocation.distanceKm,
            items: [...cartItems],
            subtotal,
            grandTotal,
            paymentMethod: "Paystack",
            paymentStatus: "Paid via Paystack",
          };

          setCompletedOrder(order);
          setOrderComplete(true);
          addOrder(order);
          clearBag();
          window.scrollTo({ top: 0, behavior: "smooth" });

          fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderType: "standard",
              orderId: order.orderId,
              paystackRef: order.paystackRef,
              customer: order.customer,
              registerAccount,
              fulfillment: order.fulfillment,
              deliveryAddress: finalAddress,
              nearestLandmark: formData.nearestLandmark.trim(),
              latitude: deliveryLocation.lat,
              longitude: deliveryLocation.lng,
              plusCode: deliveryLocation.plusCode,
              distanceKm: deliveryLocation.distanceKm,
              deliveryFee: activeDeliveryFee,
              subtotal,
              grandTotal,
              items: order.items,
            }),
          }).catch(() => {});
        },
        onCancel: () => {
          setIsProcessing(false);
        },
        onError: (err) => {
          console.error("Paystack error:", err);
          setIsProcessing(false);
          alert("Paystack checkout could not be loaded. Please try again.");
        },
      });
    } catch (err) {
      console.error("Paystack launch error:", err);
      setIsProcessing(false);
      alert("Unable to initialize Paystack checkout. Please check your setup.");
    }
  };

  const buildWhatsAppReceiptLink = () => {
    if (!completedOrder) return "";
    let msg = `Hello Nommy's Bites,\nI just completed an order and payment on your website:\n\n`;
    msg += `Order Reference: #${completedOrder.orderId}\n`;
    if (completedOrder.paystackRef) {
      msg += `Paystack Reference: ${completedOrder.paystackRef}\n`;
    }
    msg += `Customer: ${completedOrder.customer.firstName} ${completedOrder.customer.lastName}\n`;
    msg += `Phone: ${completedOrder.customer.phone}\n`;
    msg += `Fulfillment: ${
      completedOrder.fulfillment === "delivery"
        ? `Delivery to ${completedOrder.customer.deliveryAddress}`
        : "Store Pick-up at Pius Alile Mall, UNIBEN"
    }\n`;
    if (completedOrder.fulfillment === "delivery" && completedOrder.coordinates) {
      msg += `GPS Coordinates: ${completedOrder.coordinates}\n`;
      msg += `Map Pin: ${completedOrder.googleMapsUrl}\n`;
    }
    msg += `\nItems Ordered:\n`;
    completedOrder.items.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.quantity}x ${item.name} = ₦${(
        item.price * item.quantity
      ).toLocaleString()}\n`;
      if (item.customSummary) {
        msg += `   (${item.customSummary})\n`;
      }
    });
    msg += `\nSubtotal: ₦${completedOrder.subtotal.toLocaleString()}\n`;
    msg += `Delivery Fee: ₦${completedOrder.deliveryFee.toLocaleString()}\n`;
    msg += `Total: ₦${completedOrder.grandTotal.toLocaleString()} (${
      completedOrder.paymentStatus
    })\n`;

    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
  };

  if (cartItems.length === 0 && !orderComplete) {
    return (
      <div className="checkout-empty-wrap">
        <div className="checkout-empty-card">
          <h2>Your Bag is Empty</h2>
          <p>Add some items before checking out.</p>
          <button
            type="button"
            onClick={() => navigate("/menu")}
            className="checkout-btn-primary"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  if (orderComplete && completedOrder) {
    return (
      <div className="order-success-page" role="main">
        <div className="order-success-container">
          <div className="order-success-card">
            <div className="success-badge-icon" aria-hidden="true">
              ✓
            </div>
            <span className="success-pretitle">ORDER CONFIRMED</span>
            <h1 className="success-heading">Thank You for Your Order</h1>
            <p className="success-lead">
              Your payment via Paystack was successful and your order is being
              prepared.
            </p>

            {/* Order Meta Box */}
            <div className="order-meta-box">
              <div className="meta-box-col">
                <span className="meta-col-label">Order Reference</span>
                <strong className="meta-col-value highlight">
                  #{completedOrder.orderId}
                </strong>
              </div>
              <div className="meta-box-col">
                <span className="meta-col-label">Paystack Ref</span>
                <strong className="meta-col-value">
                  {completedOrder.paystackRef}
                </strong>
              </div>
              <div className="meta-box-col">
                <span className="meta-col-label">Estimated Time</span>
                <strong className="meta-col-value eta">25 – 40 mins</strong>
              </div>
              <div className="meta-box-col">
                <span className="meta-col-label">Payment Status</span>
                <span className="payment-status-badge">
                  {completedOrder.paymentStatus}
                </span>
              </div>
            </div>

            {/* Receipt Summary Details */}
            <div className="order-receipt-details">
              <h3 className="receipt-section-title">Details</h3>
              <div className="receipt-details-grid">
                <div>
                  <span className="detail-label">Recipient:</span>
                  <p className="detail-value">
                    {completedOrder.customer.firstName}{" "}
                    {completedOrder.customer.lastName}
                  </p>
                </div>
                <div>
                  <span className="detail-label">Phone:</span>
                  <p className="detail-value">{completedOrder.customer.phone}</p>
                </div>
                <div>
                  <span className="detail-label">Email:</span>
                  <p className="detail-value">{completedOrder.customer.email}</p>
                </div>
                <div>
                  <span className="detail-label">Destination:</span>
                  <p className="detail-value">
                    {completedOrder.fulfillment === "delivery"
                      ? completedOrder.customer.deliveryAddress
                      : "Pius Alile Shopping Mall, UNIBEN (Store Pick-up)"}
                  </p>
                </div>
              </div>

              <div className="receipt-items-wrap">
                <h4 className="receipt-items-title">Items</h4>
                <ul className="receipt-items-list">
                  {completedOrder.items.map((item) => (
                    <li key={item.id} className="receipt-item-row">
                      <span>
                        {item.quantity}x {item.name}
                        {item.customSummary ? ` (${item.customSummary})` : ""}
                      </span>
                      <strong>
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </strong>
                    </li>
                  ))}
                </ul>

                <div className="receipt-calc-rows">
                  <div className="calc-row">
                    <span>Items Subtotal:</span>
                    <span>₦{completedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="calc-row">
                    <span>Delivery Fee:</span>
                    <span>
                      {completedOrder.deliveryFee === 0
                        ? "Free (Pick-up)"
                        : `₦${completedOrder.deliveryFee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="calc-row grand-total">
                    <span>Total:</span>
                    <strong>₦{completedOrder.grandTotal.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="success-action-buttons">
              <a
                href={buildWhatsAppReceiptLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-receipt"
              >
                <span>Send Receipt to WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => navigate("/menu")}
                className="btn-back-menu"
              >
                Order More Bites
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page" role="main">
      {isProcessing && (
        <div className="checkout-processing-overlay" role="alert">
          <div className="processing-modal">
            <div className="spinner-ring" />
            <h3>Connecting to Paystack</h3>
            <p>Please complete payment in the Paystack window.</p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <section className="checkout-hero-section">
        <div className="checkout-container">
          <nav className="checkout-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/bag" className="breadcrumb-link">
              Bag ({totalItemsCount})
            </Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Checkout</span>
          </nav>

          <h1 className="checkout-title">Complete Your Order</h1>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="checkout-main-section">
        <div className="checkout-container">
          <form
            onSubmit={handlePayWithPaystack}
            className="checkout-grid"
            noValidate
          >
            {/* Left Column: Details & Map */}
            <div className="checkout-form-col">
              {/* Step 1: Customer Details */}
              <div className="checkout-card">
                <div className="step-badge-row">
                  <span className="step-num">1</span>
                  <h2 className="step-title">Customer Information</h2>
                </div>

                <div className="form-fields-grid">
                  <div className="form-field">
                    <label htmlFor="firstName" className="field-label">
                      First Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Osasogie"
                      className={`field-input ${
                        formErrors.firstName ? "error" : ""
                      }`}
                      autoComplete="given-name"
                    />
                    {formErrors.firstName && (
                      <span className="field-err-msg">
                        {formErrors.firstName}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="lastName" className="field-label">
                      Last Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Imasuen"
                      className={`field-input ${
                        formErrors.lastName ? "error" : ""
                      }`}
                      autoComplete="family-name"
                    />
                    {formErrors.lastName && (
                      <span className="field-err-msg">
                        {formErrors.lastName}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="email" className="field-label">
                      Email Address <span className="req">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="osasogie@gmail.com"
                      className={`field-input ${
                        formErrors.email ? "error" : ""
                      }`}
                      autoComplete="email"
                    />
                    {formErrors.email && (
                      <span className="field-err-msg">{formErrors.email}</span>
                    )}
                    <label className="checkout-register-checkbox">
                      <input
                        type="checkbox"
                        name="registerAccount"
                        checked={registerAccount}
                        onChange={(e) => setRegisterAccount(e.target.checked)}
                      />
                      <span>Register an account with this email?</span>
                    </label>
                  </div>

                  <div className="form-field">
                    <label htmlFor="phone" className="field-label">
                      Phone Number <span className="req">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0810 538 4162"
                      className={`field-input ${
                        formErrors.phone ? "error" : ""
                      }`}
                      autoComplete="tel"
                    />
                    {formErrors.phone && (
                      <span className="field-err-msg">{formErrors.phone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Delivery & Location */}
              <DeliverySection
                stepNumber={2}
                fulfillment={fulfillment}
                setFulfillment={setFulfillment}
                deliveryLocation={deliveryLocation}
                isLocationTracked={isLocationTracked}
                onLocationSelect={handleLocationSelect}
                onLocationReject={handleLocationReject}
                deliveryAddress={formData.deliveryAddress}
                nearestLandmark={formData.nearestLandmark}
                onInputChange={handleInputChange}
                formErrors={formErrors}
              />
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="checkout-summary-col">
              <div className="checkout-summary-card">
                <h3 className="summary-title">Order Summary</h3>

                <ul className="checkout-items-preview">
                  {cartItems.map((item) => (
                    <li key={item.id} className="checkout-item-preview-row">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="preview-img"
                      />
                      <div className="preview-meta">
                        <span className="preview-name">{item.name}</span>
                        {item.customSummary && (
                          <span className="preview-qty">
                            {item.customSummary}
                          </span>
                        )}
                        <span className="preview-qty">Qty: {item.quantity}</span>
                      </div>
                      <strong className="preview-price">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </strong>
                    </li>
                  ))}
                </ul>

                <div className="checkout-calc-block">
                  <div className="calc-line">
                    <span>Items Subtotal</span>
                    <span>{formattedSubtotal}</span>
                  </div>

                  <div className="calc-line">
                    <span>Delivery Fee</span>
                    <span className="fee-highlight">
                      {fulfillment === "pickup"
                        ? "Free (Pick-up)"
                        : !isLocationTracked
                          ? "Pin location on map"
                          : `₦${activeDeliveryFee.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="calc-divider" />

                  <div className="calc-line total-line">
                    <span>Total</span>
                    <span className="total-amount">
                      ₦{grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-paystack-payment"
                >
                  <span>
                    {isProcessing
                      ? "Connecting to Paystack..."
                      : "Pay with Paystack"}
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
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
