/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const USER_STORAGE_KEY = "nommys_bites_user";
const ORDERS_STORAGE_KEY = "nommys_bites_order_history";

const INITIAL_SAMPLE_ORDERS = [
  {
    orderId: "NB-84291",
    paystackRef: "pstk_demo_84291",
    date: "12 Nov 2026, 02:45 PM",
    orderType: "standard",
    customer: {
      firstName: "Osasogie",
      lastName: "Imasuen",
      email: "osasogie@gmail.com",
      phone: "08105384162",
      deliveryAddress:
        "Pius Alile Shopping Mall, UNIBEN Ugbowo Campus, Benin City",
      nearestLandmark: "Main Gate",
    },
    fulfillment: "delivery",
    deliveryAddress:
      "Pius Alile Shopping Mall, UNIBEN Ugbowo Campus, Benin City",
    nearestLandmark: "Main Gate",
    coordinates: "6.398600, 5.617800",
    googleMapsUrl: "https://www.google.com/maps?q=6.398600,5.617800",
    distanceKm: 1.2,
    deliveryFee: 1000,
    subtotal: 20500,
    grandTotal: 21500,
    paymentMethod: "Paystack",
    paymentStatus: "Paid via Paystack",
    items: [
      {
        id: 5120174,
        name: "Celebration Small Chops Box",
        price: 20500,
        formattedPrice: "₦20,500",
        image:
          "https://dodptt9f4zk9h.cloudfront.net/stores/290398/products/tn-e183741058662e95ba7e4f2d779fe35564c025e1.png",
        serves: "Serves 6–10",
        quantity: 1,
      },
    ],
  },
  {
    orderId: "NB-73192",
    paystackRef: "pstk_demo_73192",
    date: "08 Nov 2026, 11:20 AM",
    orderType: "giftbox",
    sender: {
      firstName: "Osasogie",
      lastName: "Imasuen",
      email: "osasogie@gmail.com",
      phone: "08105384162",
    },
    receiver: {
      firstName: "Amina",
      lastName: "Bello",
      phone: "08031234567",
      email: "amina@gmail.com",
    },
    noteType: "handwritten",
    handwrittenNote:
      "Happy Birthday Amina! Enjoy these warm small chops on your special day.",
    noteFee: 0,
    fulfillment: "delivery",
    deliveryAddress: "Hall 2 Hostel, University of Benin, Ugbowo Campus",
    nearestLandmark: "Hall 2 Car Park",
    coordinates: "6.399500, 5.621000",
    googleMapsUrl: "https://www.google.com/maps?q=6.399500,5.621000",
    distanceKm: 0.8,
    deliveryFee: 1000,
    subtotal: 15000,
    grandTotal: 16000,
    paymentMethod: "Paystack",
    paymentStatus: "Paid via Paystack",
    items: [
      {
        id: 5120212,
        name: "Pastry Treat Box",
        price: 15000,
        formattedPrice: "₦15,000",
        image:
          "https://dodptt9f4zk9h.cloudfront.net/stores/290398/products/tn-972b9ab3f15eb3ac983f07bd7aecf5f1ca0ef355.png",
        serves: "Serves 2–4",
        quantity: 1,
      },
    ],
  },
];

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to load user from localStorage:", e);
    return null;
  }
}

function loadStoredOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error("Failed to load orders from localStorage:", e);
  }
  return INITIAL_SAMPLE_ORDERS;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [orders, setOrders] = useState(loadStoredOrders);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!notification) return undefined;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [notification]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to save user to localStorage:", e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error("Failed to save orders to localStorage:", e);
    }
  }, [orders]);

  /**
   * Simulated login: accepts any email and logs the user in.
   * If user already has saved profile data, preserves it; otherwise initializes defaults.
   * Optionally triggers a banner notification.
   */
  const login = (email, notificationMessage) => {
    const trimmedEmail = (email || "").trim().toLowerCase();
    setUser((prev) => {
      if (prev && prev.email && prev.email.toLowerCase() === trimmedEmail) {
        return prev;
      }
      return {
        id: `usr_${Math.random().toString(36).substring(2, 9)}`,
        email: trimmedEmail,
        firstName: prev?.firstName || "Osasogie",
        lastName: prev?.lastName || "Imasuen",
        phone: prev?.phone || "08105384162",
        deliveryAddress:
          prev?.deliveryAddress ||
          "Pius Alile Shopping Mall, UNIBEN Ugbowo Campus, Benin City",
        nearestLandmark: prev?.nearestLandmark || "Main Gate",
        deliveryLocation: prev?.deliveryLocation || {
          lat: 6.3986,
          lng: 5.6178,
          plusCode: "6FRV9JXP+C4",
          distanceKm: 0.1,
          deliveryFee: 1000,
          addressText:
            "Pius Alile Shopping Mall, UNIBEN Ugbowo Campus, Benin City",
          isStore: false,
        },
      };
    });

    if (notificationMessage) {
      setNotification({ message: notificationMessage, type: "success" });
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateCheckoutInfo = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...updatedFields,
      };
    });
  };

  const addOrder = (newOrder) => {
    setOrders((prev) => {
      const exists = prev.some((o) => o.orderId === newOrder.orderId);
      if (exists) return prev;
      return [newOrder, ...prev];
    });
  };

  const getOrderById = (orderId) => {
    if (!orderId) return null;
    const cleanId = String(orderId).replace(/^#/, "").trim();
    return (
      orders.find(
        (o) =>
          String(o.orderId).replace(/^#/, "").trim() === cleanId ||
          String(o.paystackRef).trim() === cleanId
      ) || null
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        logout,
        updateCheckoutInfo,
        orders,
        addOrder,
        getOrderById,
        notification,
        showNotification,
        clearNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

