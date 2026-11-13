import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  STORE_LOCATION,
  BENIN_CITY_BOUNDS,
  isWithinBeninCity,
  calculateDistanceKm,
  calculateDeliveryFee,
} from "../utils/deliveryLocation";
import "./DeliveryMapPicker.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// Store Pin Icon
const storeIcon = L.divIcon({
  className: "custom-map-icon store-marker-icon",
  html: `<div class="store-pin-bubble"><div class="store-pin-dot"></div><div class="store-pin-tip"></div></div>`,
  iconSize: [34, 40],
  iconAnchor: [17, 40],
  popupAnchor: [0, -38],
});

// Customer Pin Icon
const customerIcon = L.divIcon({
  className: "custom-map-icon customer-marker-icon",
  html: `<div class="customer-pin-bubble"><div class="customer-pin-dot"></div><div class="customer-pin-tip"></div></div>`,
  iconSize: [34, 40],
  iconAnchor: [17, 40],
  popupAnchor: [0, -38],
});

function formatNominatimAddress(data) {
  if (!data || data.error) return "";
  const addr = data.address || {};
  const placeName =
    data.name ||
    addr.amenity ||
    addr.building ||
    addr.shop ||
    addr.office ||
    addr.tourism ||
    "";
  const road =
    addr.road ||
    addr.street ||
    addr.pedestrian ||
    addr.residential ||
    addr.path ||
    "";
  const houseNumber = addr.house_number || "";
  const streetLine =
    houseNumber && road ? `${houseNumber} ${road}` : road || houseNumber;
  const area =
    addr.neighbourhood ||
    addr.suburb ||
    addr.quarter ||
    addr.city_district ||
    addr.village ||
    "";
  const city = addr.city || addr.town || "Benin City";
  const lga = addr.county || "";
  const state = addr.state || "Edo State";

  const parts = [placeName, streetLine, area, city, lga, state].filter(Boolean);
  const unique = [];
  for (const part of parts) {
    if (!unique.some((u) => u.toLowerCase().includes(part.toLowerCase()))) {
      unique.push(part);
    }
  }
  return unique.join(", ") || data.display_name || "";
}

export default function DeliveryMapPicker({
  deliveryLocation,
  isLocationTracked,
  onLocationSelect,
  onLocationReject,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const onLocationSelectRef = useRef(onLocationSelect);
  const onLocationRejectRef = useRef(onLocationReject);

  const [isLocating, setIsLocating] = useState(false);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const [locationNotice, setLocationNotice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
    onLocationRejectRef.current = onLocationReject;
  }, [onLocationSelect, onLocationReject]);

  // Reverse Geocode coordinates using Backend (Nominatim + Local DB) with Benin City check
  const handleNewCoordinates = useCallback(async (lat, lng, map) => {
    const fixedLat = Number(Number(lat).toFixed(6));
    const fixedLng = Number(Number(lng).toFixed(6));

    if (!isWithinBeninCity(fixedLat, fixedLng)) {
      const msg =
        "Delivery is available within Benin City only. Please select a location inside Benin City.";
      if (customerMarkerRef.current) {
        customerMarkerRef.current.setLatLng([
          STORE_LOCATION.lat,
          STORE_LOCATION.lng,
        ]);
      }
      if (map) {
        map.panTo([STORE_LOCATION.lat, STORE_LOCATION.lng]);
      }
      if (onLocationRejectRef.current) {
        onLocationRejectRef.current(msg);
      } else {
        setLocationNotice(msg);
      }
      return;
    }

    setReverseGeocoding(true);
    setLocationNotice("");

    let resolvedAddress = "";
    let distanceKm = Number(
      calculateDistanceKm(
        STORE_LOCATION.lat,
        STORE_LOCATION.lng,
        fixedLat,
        fixedLng
      ).toFixed(2)
    );
    let deliveryFee = calculateDeliveryFee(distanceKm);
    let plusCode = "";
    let googleMapsUrl = `https://www.google.com/maps?q=${fixedLat},${fixedLng}`;

    try {
      const res = await fetch(
        `${API_BASE}/api/location/reverse?lat=${fixedLat}&lng=${fixedLng}`
      );
      const data = await res.json().catch(() => null);

      if (!res.ok || data?.withinBenin === false) {
        const msg =
          data?.error ||
          "Delivery is available within Benin City only. Please select a location inside Benin City.";
        if (onLocationRejectRef.current) {
          onLocationRejectRef.current(msg);
        } else {
          setLocationNotice(msg);
        }
        setReverseGeocoding(false);
        return;
      }

      if (data) {
        if (data.formattedAddress) {
          resolvedAddress = `${data.formattedAddress} (${fixedLat}, ${fixedLng})`;
        }
        if (typeof data.distanceKm === "number") {
          distanceKm = data.distanceKm;
        }
        if (typeof data.deliveryFee === "number") {
          deliveryFee = data.deliveryFee;
        }
        if (data.plusCode) {
          plusCode = data.plusCode;
        }
        if (data.googleMapsUrl) {
          googleMapsUrl = data.googleMapsUrl;
        }
      }
    } catch {
      // Direct Nominatim Reverse Geocoding fallback
      try {
        const fallbackRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${fixedLat}&lon=${fixedLng}&zoom=18&addressdetails=1&namedetails=1`,
          {
            headers: { "Accept-Language": "en" },
          }
        );
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (
            fallbackData?.address?.state &&
            !/edo/i.test(fallbackData.address.state)
          ) {
            const msg =
              "Delivery is available within Benin City only. Please select a location inside Benin City.";
            setLocationNotice(msg);
            if (onLocationRejectRef.current) {
              onLocationRejectRef.current(msg);
            }
            setReverseGeocoding(false);
            return;
          }
          const clean = formatNominatimAddress(fallbackData);
          if (clean) {
            resolvedAddress = `${clean} (${fixedLat}, ${fixedLng})`;
          }
        }
      } catch {
        // Offline fallback
      }
    } finally {
      setReverseGeocoding(false);
    }

    if (!resolvedAddress) {
      resolvedAddress = `Benin City, Edo State (${fixedLat}, ${fixedLng})`;
    }

    if (onLocationSelectRef.current) {
      onLocationSelectRef.current({
        lat: fixedLat,
        lng: fixedLng,
        distanceKm,
        deliveryFee,
        plusCode,
        googleMapsUrl,
        detectedAddress: resolvedAddress,
      });
    }

    if (map) {
      map.panTo([fixedLat, fixedLng]);
    }
  }, []);

  // Initialize Leaflet map bounded to Benin City
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = deliveryLocation?.lat || STORE_LOCATION.lat;
    const initialLng = deliveryLocation?.lng || STORE_LOCATION.lng;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      minZoom: 11,
      maxBounds: [
        [BENIN_CITY_BOUNDS.minLat - 0.04, BENIN_CITY_BOUNDS.minLng - 0.04],
        [BENIN_CITY_BOUNDS.maxLat + 0.04, BENIN_CITY_BOUNDS.maxLng + 0.04],
      ],
      maxBoundsViscosity: 0.9,
      zoomControl: true,
      scrollWheelZoom: true,
      touchZoom: true,
      dragging: true,
      doubleClickZoom: true,
      boxZoom: true,
      tap: false,
    });

    L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      attribution: "&copy; Google Maps",
      maxZoom: 20,
    }).addTo(map);

    // Store marker
    const storeMarker = L.marker([STORE_LOCATION.lat, STORE_LOCATION.lng], {
      icon: storeIcon,
      interactive: true,
    }).addTo(map);

    storeMarker.bindPopup(`
      <div style="font-family: sans-serif; text-align: center; padding: 4px;">
        <strong style="color: #451d05; font-size: 13px;">Nommy's Bites Outlet</strong><br/>
        <span style="font-size: 11px; color: #78350f;">Pius Alile Shopping Mall, UNIBEN</span>
      </div>
    `);

    // Customer marker
    const custMarker = L.marker([initialLat, initialLng], {
      icon: customerIcon,
      draggable: true,
      autoPan: true,
    }).addTo(map);

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      custMarker.setLatLng([lat, lng]);
      handleNewCoordinates(lat, lng, map);
    });

    custMarker.on("dragend", () => {
      const pos = custMarker.getLatLng();
      handleNewCoordinates(pos.lat, pos.lng, map);
    });

    mapInstanceRef.current = map;
    customerMarkerRef.current = custMarker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleNewCoordinates]);

  // Sync marker position if deliveryLocation changes externally
  useEffect(() => {
    if (
      !deliveryLocation ||
      !customerMarkerRef.current ||
      !mapInstanceRef.current
    ) {
      return;
    }

    const currentLatLng = customerMarkerRef.current.getLatLng();
    if (
      Math.abs(currentLatLng.lat - deliveryLocation.lat) > 0.0001 ||
      Math.abs(currentLatLng.lng - deliveryLocation.lng) > 0.0001
    ) {
      customerMarkerRef.current.setLatLng([
        deliveryLocation.lat,
        deliveryLocation.lng,
      ]);
      mapInstanceRef.current.panTo([
        deliveryLocation.lat,
        deliveryLocation.lng,
      ]);
    }
  }, [deliveryLocation]);

  // Browser GPS Geolocation with Benin City Validation
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setLocationNotice("");

    const getBrowserPosition = (highAccuracy, timeoutMs) =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("UNSUPPORTED"));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: highAccuracy,
          timeout: timeoutMs,
          maximumAge: 0,
        });
      });

    try {
      let lat;
      let lng;

      try {
        const pos = await getBrowserPosition(true, 12000);
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;

        // If browser returned a coarse ISP gateway outside Benin City, retry high-accuracy once
        if (!isWithinBeninCity(lat, lng)) {
          await new Promise((r) => setTimeout(r, 400));
          const retryPos = await getBrowserPosition(true, 12000);
          lat = retryPos.coords.latitude;
          lng = retryPos.coords.longitude;
        }
      } catch (firstErr) {
        if (firstErr?.code === 1) {
          throw firstErr;
        }
        await new Promise((r) => setTimeout(r, 400));
        const pos = await getBrowserPosition(true, 12000);
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }

      if (!isWithinBeninCity(lat, lng)) {
        const msg =
          "Your current location is outside Benin City. We only deliver within Benin City.";
        if (onLocationRejectRef.current) {
          onLocationRejectRef.current(msg);
        } else {
          setLocationNotice(msg);
        }
        return;
      }

      if (customerMarkerRef.current && mapInstanceRef.current) {
        customerMarkerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
      }

      await handleNewCoordinates(lat, lng, mapInstanceRef.current);
    } catch (err) {
      if (err?.code === 1) {
        setLocationNotice(
          "Location permission is blocked in your browser. Please allow location access in the address bar or click on the map."
        );
      } else {
        setLocationNotice(
          "Unable to detect location automatically. Please search your street above or click on the map."
        );
      }
    } finally {
      setIsLocating(false);
    }
  };

  // Forward Geocode Search via Backend (Nominatim + Local DB) restricted to Benin City
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/location/search?q=${encodeURIComponent(value.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
        return;
      }
      throw new Error("BACKEND_SEARCH_UNAVAILABLE");
    } catch {
      // Direct Nominatim Forward Geocoding fallback bounded to Benin City
      try {
        const hasBenin = /benin|edo|uniben|ugbowo|ekosodin/i.test(value);
        const q = hasBenin ? value.trim() : `${value.trim()}, Benin City`;
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            q
          )}&countrycodes=ng&viewbox=5.50,6.41,5.80,6.28&bounded=1&addressdetails=1&limit=6`,
          { headers: { "Accept-Language": "en" } }
        );
        if (nomRes.ok) {
          const nomItems = await nomRes.json();
          const mapped = (nomItems || [])
            .map((item) => ({
              label: formatNominatimAddress(item) || item.display_name,
              lat: Number(Number(item.lat).toFixed(6)),
              lng: Number(Number(item.lon).toFixed(6)),
            }))
            .filter((item) => isWithinBeninCity(item.lat, item.lng));
          setSearchResults(mapped);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item) => {
    setSearchQuery(item.label);
    setSearchResults([]);
    if (customerMarkerRef.current && mapInstanceRef.current) {
      customerMarkerRef.current.setLatLng([item.lat, item.lng]);
      mapInstanceRef.current.setView([item.lat, item.lng], 17, {
        animate: true,
      });
    }
    handleNewCoordinates(item.lat, item.lng, mapInstanceRef.current);
  };

  const currentLat = Number(
    deliveryLocation?.lat || STORE_LOCATION.lat
  ).toFixed(6);
  const currentLng = Number(
    deliveryLocation?.lng || STORE_LOCATION.lng
  ).toFixed(6);

  return (
    <div className="delivery-map-picker">
      {/* Nominatim Address Search Box */}
      <div className="map-search-box">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search street, hostel, or landmark in Benin City..."
          className="map-search-input"
          aria-label="Search location on map"
        />
        {isSearching && <span className="map-search-status">Searching...</span>}

        {searchResults.length > 0 && (
          <ul className="map-search-dropdown">
            {searchResults.map((item, idx) => (
              <li key={`${item.lat}-${item.lng}-${idx}`}>
                <button
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="map-search-result-btn"
                >
                  <span className="search-result-label">{item.label}</span>
                  <small className="search-result-coords">
                    {item.lat}, {item.lng}
                  </small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map Canvas */}
      <div className="map-canvas-wrapper">
        <div ref={mapContainerRef} className="map-leaflet-canvas" />

        {/* Google Maps-style My Location Button */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className={`map-my-location-btn ${isLocating ? "locating" : ""}`}
          title="Use current location"
          aria-label="Use current location"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
          </svg>
        </button>

        {reverseGeocoding && (
          <div className="map-geocoding-spinner">
            <span>Resolving address...</span>
          </div>
        )}
      </div>

      {/* Coordinates & Status Row */}
      <div className="map-coordinates-bar">
        {isLocationTracked ? (
          <>
            <span>
              <strong>Lat:</strong> {currentLat} &nbsp;|&nbsp;{" "}
              <strong>Lng:</strong> {currentLng}
              {deliveryLocation?.plusCode && (
                <>
                  {" "}
                  &nbsp;|&nbsp; <strong>Plus Code:</strong>{" "}
                  {deliveryLocation.plusCode}
                </>
              )}
            </span>
            <a
              href={`https://www.google.com/maps?q=${currentLat},${currentLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="map-open-gmaps-link"
            >
              View on Google Maps
            </a>
          </>
        ) : (
          <span>
            Click the GPS target button on the map, search your street above, or
            tap your location on the map (Benin City only).
          </span>
        )}
      </div>

      {locationNotice && (
        <div className="map-location-notice" role="status">
          {locationNotice}
        </div>
      )}
    </div>
  );
}
