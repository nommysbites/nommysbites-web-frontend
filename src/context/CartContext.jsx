/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from "react";

const CartContext = createContext(null);

const BAG_STORAGE_KEY = "nommys_bites_cart";
const GIFT_BOX_STORAGE_KEY = "nommys_bites_giftbox";

function loadStoredItems(key) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error(`Failed to load items from localStorage (${key}):`, e);
    return [];
  }
}

function saveStoredItems(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.error(`Failed to save items to localStorage (${key}):`, e);
  }
}

function buildCollectionItem(pkg, quantity) {
  return {
    id: pkg.id,
    name: pkg.name,
    price: pkg.price,
    formattedPrice: pkg.formattedPrice,
    image: pkg.image,
    serves: pkg.serves || "",
    tag: pkg.tag || "",
    customSummary: pkg.customSummary || "",
    isCustom: Boolean(pkg.isCustom),
    ...(pkg.customBoxId ? { customBoxId: pkg.customBoxId } : {}),
    ...(pkg.customQuantities ? { customQuantities: pkg.customQuantities } : {}),
    quantity,
  };
}

function upsertCollectionItem(prevItems, pkg, qty = 1) {
  const quantityToAdd = Math.max(1, parseInt(qty, 10) || 1);
  const existingIndex = prevItems.findIndex((item) => item.id === pkg.id);

  if (existingIndex > -1) {
    const updated = [...prevItems];
    updated[existingIndex] = {
      ...updated[existingIndex],
      quantity: updated[existingIndex].quantity + quantityToAdd,
    };
    return updated;
  }

  return [...prevItems, buildCollectionItem(pkg, quantityToAdd)];
}

function replaceCollectionItem(prevItems, originalId, updatedPkg, qty = 1) {
  const quantityToSet = Math.max(1, parseInt(qty, 10) || 1);
  const origIndex = prevItems.findIndex((item) => item.id === originalId);

  if (origIndex === -1) {
    return upsertCollectionItem(prevItems, updatedPkg, quantityToSet);
  }

  const collisionIndex = prevItems.findIndex(
    (item, idx) => idx !== origIndex && item.id === updatedPkg.id
  );

  if (collisionIndex > -1) {
    return prevItems
      .filter((_, idx) => idx !== origIndex)
      .map((item) =>
        item.id === updatedPkg.id
          ? {
              ...buildCollectionItem(updatedPkg, item.quantity + quantityToSet),
            }
          : item
      );
  }

  return prevItems.map((item, idx) =>
    idx === origIndex ? buildCollectionItem(updatedPkg, quantityToSet) : item
  );
}

function updateCollectionQuantity(prevItems, id, newQty) {
  const qty = parseInt(newQty, 10);
  if (isNaN(qty) || qty <= 0) {
    return prevItems.filter((item) => item.id !== id);
  }
  return prevItems.map((item) =>
    item.id === id ? { ...item, quantity: qty } : item
  );
}

function computeTotals(items) {
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const amount = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  return {
    count,
    amount,
    formatted: `₦${amount.toLocaleString()}`,
  };
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() =>
    loadStoredItems(BAG_STORAGE_KEY)
  );
  const [giftBoxItems, setGiftBoxItems] = useState(() =>
    loadStoredItems(GIFT_BOX_STORAGE_KEY)
  );

  const [toast, setToast] = useState(null); // { id, message, leaving }
  const toastHoldTimerRef = useRef(null);
  const toastExitTimerRef = useRef(null);
  const toastSeqRef = useRef(0);

  const showToast = (message) => {
    if (toastHoldTimerRef.current) clearTimeout(toastHoldTimerRef.current);
    if (toastExitTimerRef.current) clearTimeout(toastExitTimerRef.current);

    toastSeqRef.current += 1;
    const id = toastSeqRef.current;

    setToast({ id, message, leaving: false });

    toastHoldTimerRef.current = setTimeout(() => {
      setToast((curr) => (curr && curr.id === id ? { ...curr, leaving: true } : curr));
      toastExitTimerRef.current = setTimeout(() => {
        setToast((curr) => (curr && curr.id === id ? null : curr));
      }, 250);
    }, 1750);
  };

  useEffect(() => {
    saveStoredItems(BAG_STORAGE_KEY, cartItems);
  }, [cartItems]);

  useEffect(() => {
    saveStoredItems(GIFT_BOX_STORAGE_KEY, giftBoxItems);
  }, [giftBoxItems]);

  // Bag actions
  const addToBag = (pkg, qty = 1) => {
    setCartItems((prev) => upsertCollectionItem(prev, pkg, qty));
    showToast(`${pkg.name || "Item"} has been added to your bag.`);
  };

  const removeFromBag = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, newQty) => {
    setCartItems((prev) => updateCollectionQuantity(prev, id, newQty));
  };

  const clearBag = () => {
    setCartItems([]);
  };

  const updateCustomBagItem = (originalId, updatedPkg, qty = 1) => {
    setCartItems((prev) =>
      replaceCollectionItem(prev, originalId, updatedPkg, qty)
    );
    showToast(`${updatedPkg.name || "Custom Box"} has been updated in your bag.`);
  };

  // Gift Box actions
  const addToGiftBox = (pkg, qty = 1) => {
    setGiftBoxItems((prev) => upsertCollectionItem(prev, pkg, qty));
    showToast(`${pkg.name || "Item"} has been added to your gift box.`);
  };

  const removeFromGiftBox = (id) => {
    setGiftBoxItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateGiftBoxQuantity = (id, newQty) => {
    setGiftBoxItems((prev) => updateCollectionQuantity(prev, id, newQty));
  };

  const clearGiftBox = () => {
    setGiftBoxItems([]);
  };

  const updateCustomGiftBoxItem = (originalId, updatedPkg, qty = 1) => {
    setGiftBoxItems((prev) =>
      replaceCollectionItem(prev, originalId, updatedPkg, qty)
    );
    showToast(
      `${updatedPkg.name || "Custom Box"} has been updated in your gift box.`
    );
  };

  const bagTotals = computeTotals(cartItems);
  const giftBoxTotals = computeTotals(giftBoxItems);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToBag,
        removeFromBag,
        updateQuantity,
        clearBag,
        updateCustomBagItem,
        totalItemsCount: bagTotals.count,
        subtotal: bagTotals.amount,
        formattedSubtotal: bagTotals.formatted,
        giftBoxItems,
        addToGiftBox,
        removeFromGiftBox,
        updateGiftBoxQuantity,
        clearGiftBox,
        updateCustomGiftBoxItem,
        totalGiftBoxCount: giftBoxTotals.count,
        giftBoxSubtotal: giftBoxTotals.amount,
        formattedGiftBoxSubtotal: giftBoxTotals.formatted,
      }}
    >
      {children}
      {toast && (
        <div
          key={toast.id}
          className={`global-bag-toast ${toast.leaving ? "leaving" : ""}`}
          role="status"
          aria-live="polite"
        >
          <span className="global-bag-toast-icon" aria-hidden="true">
            ✓
          </span>
          <span className="global-bag-toast-text">{toast.message}</span>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
