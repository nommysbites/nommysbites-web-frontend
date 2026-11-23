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

const OLC_ALPHABET = "23456789CFGHJMPQRVWX";

// Encodes latitude and longitude into a 10-character Google Plus Code (Open Location Code)
export function encodePlusCode(lat, lng) {
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (Number.isNaN(nLat) || Number.isNaN(nLng)) return "";

  const adjustedLat = Math.min(Math.max(nLat + 90, 0), 180 - 1e-10);
  const adjustedLng = Math.min(Math.max(nLng + 180, 0), 360 - 1e-10);

  const stepSizes = [20, 1, 0.05, 0.0025, 0.000125];
  let code = "";

  for (let i = 0; i < stepSizes.length; i++) {
    const step = stepSizes[i];
    const latDigit = Math.floor(adjustedLat / step) % 20;
    const lngDigit = Math.floor(adjustedLng / step) % 20;
    code += OLC_ALPHABET[latDigit] + OLC_ALPHABET[lngDigit];
    if (i === 3) code += "+";
  }

  return code;
}

// Curated Benin City landmarks for instant offline/frontend search
export const BENIN_CITY_LANDMARKS = [
  { name: "UNIBEN Ugbowo Campus (Main Gate)", lat: 6.3986, lng: 5.6178, area: "Ugbowo" },
  { name: "Pius Alile Shopping Mall, UNIBEN", lat: 6.3986, lng: 5.6178, area: "Ugbowo" },
  { name: "UNIBEN Ekehuan Campus", lat: 6.3195, lng: 5.6022, area: "Ekehuan" },
  { name: "UBTH (University of Benin Teaching Hospital)", lat: 6.3922, lng: 5.6205, area: "Ugbowo" },
  { name: "Ring Road (King's Square / Oba Market)", lat: 6.3370, lng: 5.6258, area: "City Center" },
  { name: "Edo State Government House, GRA", lat: 6.3210, lng: 5.6225, area: "GRA" },
  { name: "Benin Airport (BNI), Airport Road", lat: 6.3170, lng: 5.5995, area: "Airport Road" },
  { name: "Kada Plaza Cinema & Entertainment, Sapele Road", lat: 6.3120, lng: 5.6290, area: "Sapele Road" },
  { name: "Uselu Shell Ramp / Market", lat: 6.3755, lng: 5.6220, area: "Uselu" },
  { name: "New Benin Market, Mission Road", lat: 6.3530, lng: 5.6320, area: "New Benin" },
  { name: "Ekosodin Village (UNIBEN Back Gate)", lat: 6.4060, lng: 5.6120, area: "Ekosodin" },
  { name: "BDPA Estate, Ugbowo", lat: 6.3880, lng: 5.6110, area: "Ugbowo" },
  { name: "Ramat Park / Ikpoba Hill", lat: 6.3490, lng: 5.6580, area: "Ikpoba Hill" },
  { name: "Oluku Junction / Toll Gate", lat: 6.4250, lng: 5.6050, area: "Oluku" },
  { name: "Aduwawa Market / Cattle Market", lat: 6.3720, lng: 5.6700, area: "Aduwawa" },
  { name: "Oregbeni Market / Ikpoba Slope", lat: 6.3420, lng: 5.6510, area: "Ikpoba Slope" },
  { name: "Upper Sakponba Road / St. Saviour", lat: 6.3150, lng: 5.6550, area: "Upper Sakponba" },
  { name: "Egor Local Government Secretariat, Uselu", lat: 6.3710, lng: 5.6150, area: "Egor" },
  { name: "Oredo Local Government Secretariat, Ring Road", lat: 6.3340, lng: 5.6270, area: "Oredo" },
  { name: "Evbuotubu / Ekenwan Barracks", lat: 6.3100, lng: 5.5800, area: "Evbuotubu" },
];
