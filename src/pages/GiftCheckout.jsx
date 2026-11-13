import { useState, useRef } from "react";
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

const SPECIALLY_DESIGNED_NOTE_FEE = 2000;
const MAX_NOTE_FILE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".pdf",
  ".doc",
  ".docx",
];

function isValidNoteFile(file) {
  if (!file) return false;
  if (file.type && file.type.startsWith("image/")) return true;
  if (file.type && ALLOWED_MIME_TYPES.has(file.type)) return true;
  const lowerName = (file.name || "").toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function GiftCheckout() {
  const navigate = useNavigate();
  const {
    giftBoxItems,
    totalGiftBoxCount,
    giftBoxSubtotal,
    formattedGiftBoxSubtotal,
    clearGiftBox,
  } = useCart();
  const { user, addOrder } = useAuth();

  const fileInputRef = useRef(null);

  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const [formData, setFormData] = useState({
    senderFirstName: user?.firstName || "",
    senderLastName: user?.lastName || "",
    senderEmail: user?.email || "",
    senderPhone: user?.phone || "",
    receiverFirstName: "",
    receiverLastName: "",
    receiverPhone: "",
    receiverEmail: "",
    handwrittenNote: "",
    deliveryAddress: "",
    nearestLandmark: "",
  });

  const [noteType, setNoteType] = useState("handwritten"); // "handwritten" | "custom"
  const [noteFile, setNoteFile] = useState(null); // { name, size, type, dataUrl, isImage }
  const [registerAccount, setRegisterAccount] = useState(false);

  const [fulfillment, setFulfillment] = useState("delivery");
  const [deliveryLocation, setDeliveryLocation] = useState(
    createInitialDeliveryLocation
  );
  const [isLocationTracked, setIsLocationTracked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const noteFee = noteType === "custom" ? SPECIALLY_DESIGNED_NOTE_FEE : 0;
  const activeDeliveryFee =
    fulfillment === "pickup" || !isLocationTracked
      ? 0
      : deliveryLocation.deliveryFee;
  const grandTotal = giftBoxSubtotal + noteFee + activeDeliveryFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleNoteTypeChange = (type) => {
    setNoteType(type);
    if (formErrors.noteFile) {
      setFormErrors((prev) => ({ ...prev, noteFile: null }));
    }
  };

  const handleNoteFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidNoteFile(file)) {
      setNoteFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFormErrors((prev) => ({
        ...prev,
        noteFile:
          "Please upload an image, PDF, or Word document (.doc, .docx).",
      }));
      return;
    }

    if (file.size > MAX_NOTE_FILE_BYTES) {
      setNoteFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFormErrors((prev) => ({
        ...prev,
        noteFile: "File size must not exceed 2MB.",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNoteFile({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result,
        isImage: Boolean(file.type && file.type.startsWith("image/")),
      });
      setFormErrors((prev) => ({ ...prev, noteFile: null }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveNoteFile = () => {
    setNoteFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFormErrors((prev) => ({ ...prev, noteFile: null }));
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

    if (!formData.senderFirstName.trim()) {
      errors.senderFirstName = "Sender's first name is required";
    }
    if (!formData.senderLastName.trim()) {
      errors.senderLastName = "Sender's last name is required";
    }
    if (!formData.senderEmail.trim() || !formData.senderEmail.includes("@")) {
      errors.senderEmail = "Valid sender email is required";
    }
    if (!formData.senderPhone.trim() || formData.senderPhone.length < 9) {
      errors.senderPhone = "Valid sender phone number is required";
    }

    if (!formData.receiverFirstName.trim()) {
      errors.receiverFirstName = "Receiver's first name is required";
    }
    if (!formData.receiverLastName.trim()) {
      errors.receiverLastName = "Receiver's last name is required";
    }
    if (!formData.receiverPhone.trim() || formData.receiverPhone.length < 9) {
      errors.receiverPhone = "Valid receiver phone number is required";
    }

    if (noteType === "custom" && !noteFile) {
      errors.noteFile =
        "Please upload your note design (image, PDF, or Word document, max 2MB)";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayWithPaystack = (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 200, behavior: "smooth" });
      return;
    }

    setIsProcessing(true);

    const orderId = `NB-GIFT-${Math.floor(100000 + Math.random() * 900000)}`;
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

    const senderFullName =
      `${formData.senderFirstName} ${formData.senderLastName}`.trim();
    const receiverFullName =
      `${formData.receiverFirstName} ${formData.receiverLastName}`.trim();

    try {
      launchPaystackCheckout({
        email: formData.senderEmail,
        firstName: formData.senderFirstName,
        lastName: formData.senderLastName,
        phone: formData.senderPhone,
        grandTotal,
        orderId,
        customFields: [
          {
            display_name: "Order Type",
            variable_name: "order_type",
            value: "Gift Box",
          },
          {
            display_name: "Sender Name",
            variable_name: "sender_name",
            value: senderFullName,
          },
          {
            display_name: "Sender Phone",
            variable_name: "sender_phone",
            value: formData.senderPhone.trim(),
          },
          {
            display_name: "Receiver Name",
            variable_name: "receiver_name",
            value: receiverFullName,
          },
          {
            display_name: "Receiver Phone",
            variable_name: "receiver_phone",
            value: formData.receiverPhone.trim(),
          },
          {
            display_name: "Note Type",
            variable_name: "note_type",
            value:
              noteType === "custom"
                ? `Specially Designed Note (${noteFile?.name || "Uploaded"})`
                : "Handwritten Note (Free)",
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
        ],
        onSuccess: (transaction) => {
          setIsProcessing(false);
          const order = {
            orderId,
            paystackRef: transaction?.reference || orderId,
            date: formatOrderTimestamp(),
            sender: {
              firstName: formData.senderFirstName.trim(),
              lastName: formData.senderLastName.trim(),
              email: formData.senderEmail.trim(),
              phone: formData.senderPhone.trim(),
            },
            receiver: {
              firstName: formData.receiverFirstName.trim(),
              lastName: formData.receiverLastName.trim(),
              phone: formData.receiverPhone.trim(),
              email: formData.receiverEmail.trim(),
            },
            noteType,
            handwrittenNote: formData.handwrittenNote.trim(),
            noteFileName: noteFile?.name || "",
            noteFileSize: noteFile?.size || 0,
            noteFee,
            deliveryAddress: finalAddress,
            fulfillment,
            coordinates: coordinatesText,
            googleMapsUrl,
            deliveryFee: activeDeliveryFee,
            distanceKm: deliveryLocation.distanceKm,
            items: [...giftBoxItems],
            subtotal: giftBoxSubtotal,
            grandTotal,
            paymentMethod: "Paystack",
            paymentStatus: "Paid via Paystack",
          };

          setCompletedOrder(order);
          setOrderComplete(true);
          addOrder({ ...order, orderType: "giftbox" });
          clearGiftBox();
          window.scrollTo({ top: 0, behavior: "smooth" });

          fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderType: "giftbox",
              orderId: order.orderId,
              paystackRef: order.paystackRef,
              customer: {
                firstName: order.sender.firstName,
                lastName: order.sender.lastName,
                email: order.sender.email,
                phone: order.sender.phone,
              },
              registerAccount,
              fulfillment: order.fulfillment,
              deliveryAddress: finalAddress,
              nearestLandmark: formData.nearestLandmark.trim(),
              latitude: deliveryLocation.lat,
              longitude: deliveryLocation.lng,
              plusCode: deliveryLocation.plusCode,
              distanceKm: deliveryLocation.distanceKm,
              deliveryFee: activeDeliveryFee,
              subtotal: giftBoxSubtotal,
              grandTotal,
              items: order.items,
              giftDetails: {
                sender: order.sender,
                receiver: order.receiver,
                noteType,
                noteFee,
                handwrittenNote: order.handwrittenNote,
                noteFileName: noteFile?.name || "",
                noteFileMime: noteFile?.type || "",
                noteFileSize: noteFile?.size || 0,
                noteFileBase64: noteFile?.dataUrl || "",
              },
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
    let msg = `Hello Nommy's Bites,\nI just completed a Gift Box order and payment on your website:\n\n`;
    msg += `Order Reference: #${completedOrder.orderId}\n`;
    if (completedOrder.paystackRef) {
      msg += `Paystack Reference: ${completedOrder.paystackRef}\n`;
    }
    msg += `Sender: ${completedOrder.sender.firstName} ${completedOrder.sender.lastName} (${completedOrder.sender.phone})\n`;
    msg += `Receiver: ${completedOrder.receiver.firstName} ${completedOrder.receiver.lastName} (${completedOrder.receiver.phone})\n`;
    msg += `Note: ${
      completedOrder.noteType === "custom"
        ? `Specially Designed Note (${completedOrder.noteFileName})`
        : completedOrder.handwrittenNote
          ? `Handwritten Note: "${completedOrder.handwrittenNote}"`
          : "Handwritten Note (No message entered)"
    }\n`;
    msg += `Fulfillment: ${
      completedOrder.fulfillment === "delivery"
        ? `Delivery to ${completedOrder.deliveryAddress}`
        : "Store Pick-up at Pius Alile Mall, UNIBEN"
    }\n`;
    if (completedOrder.fulfillment === "delivery" && completedOrder.coordinates) {
      msg += `GPS Coordinates: ${completedOrder.coordinates}\n`;
      msg += `Map Pin: ${completedOrder.googleMapsUrl}\n`;
    }
    msg += `\nGift Items:\n`;
    completedOrder.items.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.quantity}x ${item.name} = ₦${(
        item.price * item.quantity
      ).toLocaleString()}\n`;
      if (item.customSummary) {
        msg += `   (${item.customSummary})\n`;
      }
    });
    msg += `\nItems Subtotal: ₦${completedOrder.subtotal.toLocaleString()}\n`;
    msg += `Gift Note: ${
      completedOrder.noteFee === 0
        ? "Free (Handwritten)"
        : `₦${completedOrder.noteFee.toLocaleString()}`
    }\n`;
    msg += `Delivery Fee: ₦${completedOrder.deliveryFee.toLocaleString()}\n`;
    msg += `Total: ₦${completedOrder.grandTotal.toLocaleString()} (${
      completedOrder.paymentStatus
    })\n`;

    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
  };

  if (giftBoxItems.length === 0 && !orderComplete) {
    return (
      <div className="checkout-empty-wrap">
        <div className="checkout-empty-card">
          <h2>Your Gift Box is Empty</h2>
          <p>Add some gift items before checking out.</p>
          <button
            type="button"
            onClick={() => navigate("/gift")}
            className="checkout-btn-primary"
          >
            Browse Gift Items
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
            <span className="success-pretitle">GIFT ORDER CONFIRMED</span>
            <h1 className="success-heading">Thank You for Your Gift Order</h1>
            <p className="success-lead">
              Your payment via Paystack was successful and your gift box is
              being prepared.
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
                <span className="meta-col-label">Note Type</span>
                <strong className="meta-col-value">
                  {completedOrder.noteType === "custom"
                    ? "Specially Designed"
                    : "Handwritten (Free)"}
                </strong>
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
              <h3 className="receipt-section-title">Gift Order Details</h3>
              <div className="receipt-details-grid">
                <div>
                  <span className="detail-label">Sender:</span>
                  <p className="detail-value">
                    {completedOrder.sender.firstName}{" "}
                    {completedOrder.sender.lastName} ({completedOrder.sender.phone})
                  </p>
                </div>
                <div>
                  <span className="detail-label">Receiver:</span>
                  <p className="detail-value">
                    {completedOrder.receiver.firstName}{" "}
                    {completedOrder.receiver.lastName} ({completedOrder.receiver.phone})
                  </p>
                </div>
                <div>
                  <span className="detail-label">Gift Note:</span>
                  <p className="detail-value">
                    {completedOrder.noteType === "custom"
                      ? `Specially Designed Note (${completedOrder.noteFileName})`
                      : completedOrder.handwrittenNote || "Handwritten Note"}
                  </p>
                </div>
                <div>
                  <span className="detail-label">Destination:</span>
                  <p className="detail-value">
                    {completedOrder.fulfillment === "delivery"
                      ? completedOrder.deliveryAddress
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
                    <span>Gift Note:</span>
                    <span>
                      {completedOrder.noteFee === 0
                        ? "Free (Handwritten)"
                        : `₦${completedOrder.noteFee.toLocaleString()}`}
                    </span>
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
                onClick={() => navigate("/gift")}
                className="btn-back-menu"
              >
                Browse More Gifts
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
            <Link to="/giftbox" className="breadcrumb-link">
              Gift Box ({totalGiftBoxCount})
            </Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Checkout</span>
          </nav>

          <h1 className="checkout-title">Complete Your Gift Order</h1>
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
            {/* Left Column: Sender, Receiver, Note & Delivery */}
            <div className="checkout-form-col">
              {/* Step 1: Sender's Details */}
              <div className="checkout-card">
                <div className="step-badge-row">
                  <span className="step-num">1</span>
                  <h2 className="step-title">Sender&apos;s Details</h2>
                </div>

                <div className="form-fields-grid">
                  <div className="form-field">
                    <label htmlFor="senderFirstName" className="field-label">
                      First Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="senderFirstName"
                      name="senderFirstName"
                      value={formData.senderFirstName}
                      onChange={handleInputChange}
                      placeholder="Osasogie"
                      className={`field-input ${
                        formErrors.senderFirstName ? "error" : ""
                      }`}
                      autoComplete="given-name"
                    />
                    {formErrors.senderFirstName && (
                      <span className="field-err-msg">
                        {formErrors.senderFirstName}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="senderLastName" className="field-label">
                      Last Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="senderLastName"
                      name="senderLastName"
                      value={formData.senderLastName}
                      onChange={handleInputChange}
                      placeholder="Imasuen"
                      className={`field-input ${
                        formErrors.senderLastName ? "error" : ""
                      }`}
                      autoComplete="family-name"
                    />
                    {formErrors.senderLastName && (
                      <span className="field-err-msg">
                        {formErrors.senderLastName}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="senderEmail" className="field-label">
                      Email Address <span className="req">*</span>
                    </label>
                    <input
                      type="email"
                      id="senderEmail"
                      name="senderEmail"
                      value={formData.senderEmail}
                      onChange={handleInputChange}
                      placeholder="osasogie@gmail.com"
                      className={`field-input ${
                        formErrors.senderEmail ? "error" : ""
                      }`}
                      autoComplete="email"
                    />
                    {formErrors.senderEmail && (
                      <span className="field-err-msg">
                        {formErrors.senderEmail}
                      </span>
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
                    <label htmlFor="senderPhone" className="field-label">
                      Phone Number <span className="req">*</span>
                    </label>
                    <input
                      type="tel"
                      id="senderPhone"
                      name="senderPhone"
                      value={formData.senderPhone}
                      onChange={handleInputChange}
                      placeholder="0810 538 4162"
                      className={`field-input ${
                        formErrors.senderPhone ? "error" : ""
                      }`}
                      autoComplete="tel"
                    />
                    {formErrors.senderPhone && (
                      <span className="field-err-msg">
                        {formErrors.senderPhone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Receiver's Details */}
              <div className="checkout-card">
                <div className="step-badge-row">
                  <span className="step-num">2</span>
                  <h2 className="step-title">Receiver&apos;s Details</h2>
                </div>

                <div className="form-fields-grid">
                  <div className="form-field">
                    <label htmlFor="receiverFirstName" className="field-label">
                      First Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="receiverFirstName"
                      name="receiverFirstName"
                      value={formData.receiverFirstName}
                      onChange={handleInputChange}
                      placeholder="Efe"
                      className={`field-input ${
                        formErrors.receiverFirstName ? "error" : ""
                      }`}
                    />
                    {formErrors.receiverFirstName && (
                      <span className="field-err-msg">
                        {formErrors.receiverFirstName}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="receiverLastName" className="field-label">
                      Last Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="receiverLastName"
                      name="receiverLastName"
                      value={formData.receiverLastName}
                      onChange={handleInputChange}
                      placeholder="Omoregie"
                      className={`field-input ${
                        formErrors.receiverLastName ? "error" : ""
                      }`}
                    />
                    {formErrors.receiverLastName && (
                      <span className="field-err-msg">
                        {formErrors.receiverLastName}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="receiverPhone" className="field-label">
                      Phone Number <span className="req">*</span>
                    </label>
                    <input
                      type="tel"
                      id="receiverPhone"
                      name="receiverPhone"
                      value={formData.receiverPhone}
                      onChange={handleInputChange}
                      placeholder="0803 000 0000"
                      className={`field-input ${
                        formErrors.receiverPhone ? "error" : ""
                      }`}
                    />
                    {formErrors.receiverPhone && (
                      <span className="field-err-msg">
                        {formErrors.receiverPhone}
                      </span>
                    )}
                  </div>

                  <div className="form-field">
                    <label htmlFor="receiverEmail" className="field-label">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      id="receiverEmail"
                      name="receiverEmail"
                      value={formData.receiverEmail}
                      onChange={handleInputChange}
                      placeholder="efe@gmail.com"
                      className="field-input"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Gift Note */}
              <div className="checkout-card">
                <div className="step-badge-row">
                  <span className="step-num">3</span>
                  <h2 className="step-title">Gift Note</h2>
                </div>

                <div className="checkout-fulfillment-toggle">
                  <button
                    type="button"
                    className={`fulfillment-btn ${
                      noteType === "handwritten" ? "active" : ""
                    }`}
                    onClick={() => handleNoteTypeChange("handwritten")}
                  >
                    <div className="fulfillment-text">
                      <strong>Regular Handwritten Note</strong>
                      <small>Free (₦0)</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`fulfillment-btn ${
                      noteType === "custom" ? "active" : ""
                    }`}
                    onClick={() => handleNoteTypeChange("custom")}
                  >
                    <div className="fulfillment-text">
                      <strong>Specially Designed Note</strong>
                      <small>+₦2,000 (Upload design)</small>
                    </div>
                  </button>
                </div>

                {noteType === "handwritten" ? (
                  <div className="form-field full-width">
                    <label htmlFor="handwrittenNote" className="field-label">
                      Handwritten Note Message
                    </label>
                    <textarea
                      id="handwrittenNote"
                      name="handwrittenNote"
                      rows="3"
                      value={formData.handwrittenNote}
                      onChange={handleInputChange}
                      placeholder="Write the message you'd like us to handwrite inside the gift box..."
                      className="field-input note-textarea"
                    />
                  </div>
                ) : (
                  <div className="form-field full-width">
                    <label htmlFor="noteFileInput" className="field-label">
                      Upload Designed Note (Image, PDF, or Word document, max
                      2MB) <span className="req">*</span>
                    </label>

                    <div
                      className={`note-upload-box ${
                        formErrors.noteFile ? "error" : ""
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="noteFileInput"
                        accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleNoteFileChange}
                        className="note-file-hidden-input"
                      />

                      {!noteFile ? (
                        <label
                          htmlFor="noteFileInput"
                          className="note-upload-trigger"
                        >
                          <span className="note-upload-cta">Choose File</span>
                          <span className="note-upload-hint">
                            PNG, JPG, WEBP, PDF, DOC, or DOCX up to 2MB
                          </span>
                        </label>
                      ) : (
                        <div className="note-file-selected">
                          {noteFile.isImage && (
                            <img
                              src={noteFile.dataUrl}
                              alt="Uploaded note preview"
                              className="note-file-thumb"
                            />
                          )}
                          <div className="note-file-meta">
                            <strong className="note-file-name">
                              {noteFile.name}
                            </strong>
                            <span className="note-file-size">
                              {formatFileSize(noteFile.size)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveNoteFile}
                            className="note-file-remove-btn"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    {formErrors.noteFile && (
                      <span className="field-err-msg">
                        {formErrors.noteFile}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Step 4: Delivery & Location */}
              <DeliverySection
                stepNumber={4}
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
                  {giftBoxItems.map((item) => (
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
                    <span>{formattedGiftBoxSubtotal}</span>
                  </div>

                  <div className="calc-line">
                    <span>Gift Note</span>
                    <span className="fee-highlight">
                      {noteFee === 0
                        ? "Free (Handwritten)"
                        : `₦${noteFee.toLocaleString()}`}
                    </span>
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

