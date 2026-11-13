import DeliveryMapPicker from "./DeliveryMapPicker";

/**
 * Reusable Delivery & Location step used by both standard checkout and gift box checkout.
 */
export default function DeliverySection({
  stepNumber = 2,
  fulfillment,
  setFulfillment,
  deliveryLocation,
  isLocationTracked,
  onLocationSelect,
  onLocationReject,
  deliveryAddress,
  nearestLandmark,
  onInputChange,
  formErrors,
}) {
  return (
    <div className="checkout-card">
      <div className="step-badge-row">
        <span className="step-num">{stepNumber}</span>
        <h2 className="step-title">Delivery &amp; Location</h2>
      </div>

      {/* Mode Toggle */}
      <div className="checkout-fulfillment-toggle">
        <button
          type="button"
          className={`fulfillment-btn ${
            fulfillment === "delivery" ? "active" : ""
          }`}
          onClick={() => setFulfillment("delivery")}
        >
          <div className="fulfillment-text">
            <strong>Delivery to Address</strong>
            <small>Benin City Only</small>
          </div>
        </button>

        <button
          type="button"
          className={`fulfillment-btn ${
            fulfillment === "pickup" ? "active" : ""
          }`}
          onClick={() => setFulfillment("pickup")}
        >
          <div className="fulfillment-text">
            <strong>Store Pick-up (Free)</strong>
            <small>Pius Alile Mall, UNIBEN</small>
          </div>
        </button>
      </div>

      {fulfillment === "delivery" ? (
        <div className="delivery-location-section">
          <div className="benin-only-banner">
            Note: Delivery is available within Benin City only.
          </div>

          {/* 1. Interactive Map First (Required) */}
          <div className="form-field full-width map-picker-block">
            <label className="field-label">
              Track or Pin Your Location on the Map (Benin City Only){" "}
              <span className="req">*</span>
            </label>
            <DeliveryMapPicker
              deliveryLocation={deliveryLocation}
              isLocationTracked={isLocationTracked}
              onLocationSelect={onLocationSelect}
              onLocationReject={onLocationReject}
            />
            {formErrors.mapLocation && (
              <span className="field-err-msg">{formErrors.mapLocation}</span>
            )}
          </div>

          {/* 2. Read-Only Delivery Address Input (Coordinates Only) */}
          <div className="form-field full-width">
            <label htmlFor="deliveryAddress" className="field-label">
              Delivery Address (Latitude &amp; Longitude){" "}
              <span className="req">*</span>
            </label>
            <input
              type="text"
              id="deliveryAddress"
              name="deliveryAddress"
              value={deliveryAddress}
              readOnly
              placeholder="Pin your location on the map above to populate latitude and longitude"
              className={`field-input readonly-input ${
                formErrors.deliveryAddress ? "error" : ""
              }`}
            />
            {formErrors.deliveryAddress && (
              <span className="field-err-msg">
                {formErrors.deliveryAddress}
              </span>
            )}
          </div>

          {/* 3. Separate Input to Further Describe / Specify Address */}
          <div className="form-field full-width">
            <label htmlFor="nearestLandmark" className="field-label">
              Specify / Further Describe Your Address
            </label>
            <input
              type="text"
              id="nearestLandmark"
              name="nearestLandmark"
              value={nearestLandmark}
              onChange={onInputChange}
              placeholder="Street name, house number, hostel block/room, or nearest landmark"
              className="field-input"
            />
          </div>
        </div>
      ) : (
        <div className="pickup-notice-box">
          <div className="pickup-info">
            <h4>Pick-up Location:</h4>
            <p>
              Nommy&apos;s Bites Main Outlet, Pius Alile Shopping Mall, UNIBEN
              Ugbowo Campus, Benin City.
            </p>
            <span className="pickup-free-pill">
              Delivery Fee: ₦0 (Free Pick-up)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

