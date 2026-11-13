import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AccountGuard from "../../components/AccountGuard";
import DeliveryMapPicker from "../../components/DeliveryMapPicker";
import "./Account.css";

function CheckoutInfoContent() {
  const { user, updateCheckoutInfo } = useAuth();

  const [formData, setFormData] = useState(() => ({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    deliveryAddress:
      user?.deliveryAddress ||
      (user?.deliveryLocation
        ? `${user.deliveryLocation.lat}, ${user.deliveryLocation.lng}`
        : ""),
    nearestLandmark: user?.nearestLandmark || "",
  }));

  const [deliveryLocation, setDeliveryLocation] = useState(
    () =>
      user?.deliveryLocation || {
        lat: 6.3986,
        lng: 5.6178,
        plusCode: "6FRV9JXP+C4",
        distanceKm: 0.1,
        deliveryFee: 1000,
        addressText:
          "Pius Alile Shopping Mall, UNIBEN Ugbowo Campus, Benin City",
        isStore: false,
      },
  );

  const [isLocationTracked, setIsLocationTracked] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
    if (saveSuccess) setSaveSuccess(false);
  };

  const handleLocationSelect = (loc) => {
    setDeliveryLocation(loc);
    setIsLocationTracked(true);
    setFormError("");
    setSaveSuccess(false);
    setFormData((prev) => ({
      ...prev,
      deliveryAddress: `${Number(loc.lat).toFixed(6)}, ${Number(
        loc.lng,
      ).toFixed(6)}`,
    }));
  };

  const handleLocationReject = (msg) => {
    setFormError(
      msg ||
        "Delivery is available within Benin City only. Please choose a pin inside Benin City.",
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setFormError("Please enter both your first and last name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 9) {
      setFormError("Please enter a valid phone number.");
      return;
    }

    setFormError("");
    updateCheckoutInfo({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      deliveryAddress: formData.deliveryAddress.trim(),
      nearestLandmark: formData.nearestLandmark.trim(),
      deliveryLocation,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3500);
  };

  return (
    <div className="account-page">
      <div className="account-container">
        {/* Page Header */}
        <div className="account-header">
          <h1 className="account-title">Checkout Information</h1>
          <p className="account-subtitle">
            Manage your personal details and saved delivery address.
          </p>
        </div>

        {/* Status Alerts */}
        {saveSuccess && (
          <div className="account-alert success" role="status">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Changes saved successfully.</span>
          </div>
        )}

        {formError && (
          <div className="account-alert error" role="alert">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{formError}</span>
          </div>
        )}

        {/* Form Directly on the Page (No Containers) */}
        <form onSubmit={handleSubmit} className="account-form" noValidate>
          {/* Section: Contact Information */}
          <div className="account-section">
            <h2 className="account-section-title">Contact Information</h2>
            <div className="account-form-grid">
              <div className="account-field">
                <label htmlFor="firstName" className="account-label">
                  First Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="account-input"
                  required
                />
              </div>

              <div className="account-field">
                <label htmlFor="lastName" className="account-label">
                  Last Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="account-input"
                  required
                />
              </div>

              <div className="account-field">
                <label htmlFor="email" className="account-label">
                  Email Address <span className="req">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="account-input"
                  required
                />
              </div>

              <div className="account-field">
                <label htmlFor="phone" className="account-label">
                  Phone Number <span className="req">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="08012345678"
                  className="account-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Delivery Location */}
          <div className="account-section">
            <h2 className="account-section-title">Default Delivery Location</h2>
            <p className="account-section-desc">
              Pin your location on the map to automatically set your
              coordinates. Delivery is available within Benin City only.
            </p>

            <DeliveryMapPicker
              deliveryLocation={deliveryLocation}
              isLocationTracked={isLocationTracked}
              onLocationSelect={handleLocationSelect}
              onLocationReject={handleLocationReject}
            />

            <div className="account-form-grid account-address-grid">
              <div className="account-field full-width">
                <label htmlFor="deliveryAddress" className="account-label">
                  Delivery Address (Latitude &amp; Longitude)
                </label>
                <input
                  type="text"
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  readOnly
                  placeholder="Pin your location on the map above to set coordinates"
                  className="account-input readonly-input"
                />
              </div>

              <div className="account-field full-width">
                <label htmlFor="nearestLandmark" className="account-label">
                  Nearest Landmark / Building Details
                </label>
                <input
                  type="text"
                  id="nearestLandmark"
                  name="nearestLandmark"
                  value={formData.nearestLandmark}
                  onChange={handleInputChange}
                  placeholder="e.g. Opposite Faculty of Life Sciences, Main Gate"
                  className="account-input"
                />
              </div>
            </div>
          </div>

          <div className="account-form-actions">
            <button type="submit" className="btn-account-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutInfo() {
  const { user } = useAuth();
  return (
    <AccountGuard>
      <CheckoutInfoContent key={user?.id || user?.email || "anon"} />
    </AccountGuard>
  );
}
