// Nommy's Bites Outlet at Pius Alile Shopping Mall, UNIBEN Ugbowo Campus
export const STORE_LOCATION = {
  name: "Nommy's Bites Outlet (Pius Alile Mall, UNIBEN)",
  lat: 6.3986,
  lng: 5.6178,
};

// Benin City Delivery Zone Bounding Box
// Latitude: 6° 17' N to 6° 24' N (6.28° N – 6.41° N)
// Longitude: 5° 30' E to 5° 48' E (5.50° E – 5.80° E)
export const BENIN_CITY_BOUNDS = {
  minLat: 6.28,
  maxLat: 6.41,
  minLng: 5.5,
  maxLng: 5.8,
};

// Check if coordinates are inside Benin City
export function isWithinBeninCity(lat, lng) {
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (Number.isNaN(nLat) || Number.isNaN(nLng)) return false;
  return (
    nLat >= BENIN_CITY_BOUNDS.minLat &&
    nLat <= BENIN_CITY_BOUNDS.maxLat &&
    nLng >= BENIN_CITY_BOUNDS.minLng &&
    nLng <= BENIN_CITY_BOUNDS.maxLng
  );
}

// Haversine distance formula in kilometers
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const DELIVERY_RATE_PER_KM = 350;

// Calculate dynamic delivery fee in Naira (350 * distanceKm, rounded up to nearest 100)
export function calculateDeliveryFee(distanceKm) {
  const dist = Math.max(0, Number(distanceKm) || 0);
  const rawFee = dist * DELIVERY_RATE_PER_KM;
  return Math.max(100, Math.ceil(rawFee / 100) * 100);
}
