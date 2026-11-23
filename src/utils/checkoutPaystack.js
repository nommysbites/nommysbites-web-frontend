import PaystackPop from "@paystack/inline-js";
import { STORE_LOCATION, isWithinBeninCity } from "./deliveryLocation";

export const WHATSAPP_PHONE = "2348105384162";

export const PAYSTACK_PUBLIC_KEY =
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
  "pk_test_d32bb58661ea870e28f32eef57d762d665dfb4a4";

export function createInitialDeliveryLocation() {
  return {
    lat: STORE_LOCATION.lat,
    lng: STORE_LOCATION.lng,
    distanceKm: 0,
    deliveryFee: 0,
    plusCode: "",
    googleMapsUrl: `https://www.google.com/maps?q=${STORE_LOCATION.lat},${STORE_LOCATION.lng}`,
    detectedAddress: "",
  };
}

export function validateDeliveryFields({
  fulfillment,
  isLocationTracked,
  deliveryLocation,
  deliveryAddress,
}) {
  const errors = {};
  if (fulfillment !== "delivery") return errors;

  if (!isLocationTracked) {
    errors.mapLocation = "Please track or pin your delivery location on the map";
  } else if (!isWithinBeninCity(deliveryLocation.lat, deliveryLocation.lng)) {
    errors.mapLocation =
      "Delivery is available within Benin City only. Please select a location inside Benin City.";
  }

  if (!deliveryAddress.trim()) {
    errors.deliveryAddress = "Delivery address is required";
  }

  return errors;
}

export function teachAddressStore({
  fulfillment: _fulfillment,
  nearestLandmark: _nearestLandmark,
  deliveryLocation: _deliveryLocation,
}) {
  // Frontend only: zero backend API calls
}

export function resolveFinalAddress({
  fulfillment,
  deliveryLocation,
  nearestLandmark,
}) {
  const coordinatesText =
    fulfillment === "delivery"
      ? `${deliveryLocation.lat}, ${deliveryLocation.lng}`
      : `${STORE_LOCATION.lat}, ${STORE_LOCATION.lng}`;

  const finalAddress =
    fulfillment === "delivery"
      ? nearestLandmark.trim()
        ? `${nearestLandmark.trim()} (${coordinatesText})`
        : coordinatesText
      : "Nommy's Bites Outlet (Pius Alile Shopping Mall, UNIBEN Ugbowo Campus) — Store Pick-up";

  const googleMapsUrl =
    deliveryLocation.googleMapsUrl ||
    `https://www.google.com/maps?q=${coordinatesText}`;

  return { coordinatesText, finalAddress, googleMapsUrl };
}

export function launchPaystackCheckout({
  email,
  firstName,
  lastName,
  phone,
  grandTotal,
  orderId,
  customFields,
  onSuccess,
  onCancel,
  onError,
}) {
  const paystack = new PaystackPop();
  paystack.newTransaction({
    key: PAYSTACK_PUBLIC_KEY,
    email: email.trim(),
    amount: Math.round(grandTotal * 100),
    currency: "NGN",
    ref: orderId,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    phone: phone.trim(),
    metadata: {
      custom_fields: customFields,
    },
    onSuccess,
    onCancel,
    onError,
  });
}

export function formatOrderTimestamp() {
  return new Date().toLocaleDateString("en-NG", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

