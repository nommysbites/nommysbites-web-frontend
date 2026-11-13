import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import pkgRegularImg from "../assets/packages/pkg-5118559.png";
import pkgMediumImg from "../assets/packages/pkg-5114555.png";
import pkgLargeImg from "../assets/packages/pkg-5120212.png";
import pkgPartyImg from "../assets/packages/pkg-5120174.png";
import "./CustomPackage.css";

const BOX_OPTIONS = [
  {
    id: "regular-box",
    name: "Regular Box",
    maxSlots: 32,
    serves: "Serves 1–2",
    description: "Compact box for personal cravings and quick bites",
    image: pkgRegularImg,
  },
  {
    id: "medium-box",
    name: "Medium Box",
    maxSlots: 56,
    serves: "Serves 2–4",
    description: "Mid-size box for sharing or a hearty combo",
    image: pkgMediumImg,
  },
  {
    id: "large-box",
    name: "Large Box",
    maxSlots: 84,
    serves: "Serves 4–6",
    description: "Spacious box for pastries, proteins, and small chops",
    image: pkgLargeImg,
  },
  {
    id: "party-box",
    name: "Party Box",
    maxSlots: 120,
    serves: "Serves 6–10",
    description: "Extra-large box for group hangouts and celebrations",
    image: pkgPartyImg,
  },
];

const SELECTABLE_ITEMS = [
  {
    id: "puff-puff",
    name: "Puff Puff",
    category: "Small Chops",
    slots: 1,
    price: 100,
  },
  {
    id: "samosa",
    name: "Samosa",
    category: "Small Chops",
    slots: 1,
    price: 350,
  },
  {
    id: "spring-roll",
    name: "Spring Roll",
    category: "Small Chops",
    slots: 2,
    price: 350,
  },
  {
    id: "pepper-sauce",
    name: "Mini Pepper Sauce",
    category: "Sides & Dips",
    slots: 2,
    price: 300,
  },
  {
    id: "beef-skewer",
    name: "Beef Skewer",
    category: "Proteins",
    slots: 6,
    price: 2200,
  },
  {
    id: "waffle",
    name: "Chocolate-Drizzled Waffle",
    category: "Pastries",
    slots: 8,
    price: 1200,
  },
  {
    id: "meat-pie",
    name: "Meat Pie",
    category: "Pastries",
    slots: 9,
    price: 1400,
  },
  {
    id: "doughnut",
    name: "Ring Doughnut",
    category: "Pastries",
    slots: 9,
    price: 1200,
  },
  {
    id: "peppered-chicken",
    name: "Peppered Chicken",
    category: "Proteins",
    slots: 10,
    price: 2600,
  },
  {
    id: "medium-turkey",
    name: "Medium Peppered Turkey",
    category: "Proteins",
    slots: 14,
    price: 4200,
  },
  {
    id: "large-turkey",
    name: "Large Peppered Turkey",
    category: "Proteins",
    slots: 18,
    price: 5500,
  },
];

function buildEmptyQuantities() {
  return SELECTABLE_ITEMS.reduce((acc, item) => {
    acc[item.id] = 0;
    return acc;
  }, {});
}

function parseCustomPackageState(item) {
  const quantities = buildEmptyQuantities();
  let boxId = BOX_OPTIONS[0].id;

  if (!item) {
    return { boxId, quantities, boxQuantity: 1 };
  }

  if (item.customBoxId && BOX_OPTIONS.some((b) => b.id === item.customBoxId)) {
    boxId = item.customBoxId;
  } else if (typeof item.id === "string" && item.id.startsWith("custom-")) {
    const [prefix] = item.id.split("__");
    const parsedBoxId = prefix.replace(/^custom-/, "");
    if (BOX_OPTIONS.some((b) => b.id === parsedBoxId)) {
      boxId = parsedBoxId;
    }
  }

  if (item.customQuantities && typeof item.customQuantities === "object") {
    SELECTABLE_ITEMS.forEach((entry) => {
      const val = parseInt(item.customQuantities[entry.id], 10);
      if (!isNaN(val) && val > 0) {
        quantities[entry.id] = val;
      }
    });
  } else if (typeof item.id === "string" && item.id.includes("__")) {
    const signature = item.id.split("__")[1] || "";
    signature.split("_").forEach((pair) => {
      const [itemId, qtyStr] = pair.split(":");
      const val = parseInt(qtyStr, 10);
      if (itemId && Object.hasOwn(quantities, itemId) && !isNaN(val) && val > 0) {
        quantities[itemId] = val;
      }
    });
  }

  const boxQuantity = Math.max(1, parseInt(item.quantity, 10) || 1);
  return { boxId, quantities, boxQuantity };
}

export default function CustomPackage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    cartItems,
    giftBoxItems,
    addToBag,
    addToGiftBox,
    updateCustomBagItem,
    updateCustomGiftBoxItem,
  } = useCart();

  const editItemId = searchParams.get("edit");
  const requestedTarget = searchParams.get("target");

  const matchInGiftBox = editItemId
    ? giftBoxItems.find((i) => i.id === editItemId && i.isCustom)
    : null;
  const matchInBag = editItemId
    ? cartItems.find((i) => i.id === editItemId && i.isCustom)
    : null;

  const editingItem =
    requestedTarget === "giftbox"
      ? matchInGiftBox
      : requestedTarget === "bag"
        ? matchInBag
        : matchInBag || matchInGiftBox;

  const editTarget =
    requestedTarget === "giftbox" || (!requestedTarget && matchInGiftBox && !matchInBag)
      ? "giftbox"
      : "bag";
  const isEditMode = Boolean(editItemId);
  const editKey = editingItem
    ? `${editTarget}:${editingItem.id}`
    : editItemId
      ? `missing:${editTarget}:${editItemId}`
      : "create";

  const initialState = parseCustomPackageState(editingItem);

  const [prevEditKey, setPrevEditKey] = useState(editKey);
  const [selectedBoxId, setSelectedBoxId] = useState(initialState.boxId);
  const [quantities, setQuantities] = useState(initialState.quantities);
  const [boxQuantity, setBoxQuantity] = useState(initialState.boxQuantity);
  const [isSaving, setIsSaving] = useState(false);

  if (prevEditKey !== editKey && !isSaving) {
    const nextState = parseCustomPackageState(editingItem);
    setPrevEditKey(editKey);
    setSelectedBoxId(nextState.boxId);
    setQuantities(nextState.quantities);
    setBoxQuantity(nextState.boxQuantity);
  }

  const selectedBoxIndex = BOX_OPTIONS.findIndex(
    (b) => b.id === selectedBoxId
  );
  const selectedBox = BOX_OPTIONS[selectedBoxIndex] || BOX_OPTIONS[0];

  // Compute total used slots and unit price
  const usedSlots = SELECTABLE_ITEMS.reduce(
    (sum, item) => sum + (quantities[item.id] || 0) * item.slots,
    0
  );
  const remainingSlots = Math.max(0, selectedBox.maxSlots - usedSlots);
  const fillPercentage = Math.min(
    100,
    Math.round((usedSlots / selectedBox.maxSlots) * 100)
  );

  const selectedItems = SELECTABLE_ITEMS.filter(
    (item) => (quantities[item.id] || 0) > 0
  );

  const singleBoxPrice = SELECTABLE_ITEMS.reduce(
    (sum, item) => sum + (quantities[item.id] || 0) * item.price,
    0
  );
  const totalOrderPrice = singleBoxPrice * boxQuantity;

  const handleBoxSelect = (box) => {
    if (usedSlots > box.maxSlots) return;
    setSelectedBoxId(box.id);
  };

  const handleQtyChange = (item, delta) => {
    setQuantities((prev) => {
      const currentQty = prev[item.id] || 0;
      if (delta > 0) {
        const maxAdditional = Math.floor(remainingSlots / item.slots);
        const toAdd = Math.min(delta, maxAdditional);
        if (toAdd <= 0) return prev;
        return { ...prev, [item.id]: currentQty + toAdd };
      } else {
        return { ...prev, [item.id]: Math.max(0, currentQty + delta) };
      }
    });
  };

  const handleDirectQty = (item, rawValue) => {
    const parsed = parseInt(rawValue, 10);
    const desired = isNaN(parsed) || parsed < 0 ? 0 : parsed;

    setQuantities((prev) => {
      const currentQty = prev[item.id] || 0;
      const slotsUsedByOthers = usedSlots - currentQty * item.slots;
      const availableSlotsForThis = Math.max(
        0,
        selectedBox.maxSlots - slotsUsedByOthers
      );
      const maxAllowedQty = Math.floor(availableSlotsForThis / item.slots);
      return {
        ...prev,
        [item.id]: Math.min(desired, maxAllowedQty),
      };
    });
  };

  const handleClearItems = () => {
    setQuantities(buildEmptyQuantities());
  };

  const buildCustomPackagePayload = () => {
    const itemSignature = selectedItems
      .map((item) => `${item.id}:${quantities[item.id]}`)
      .join("_");
    const customId = `custom-${selectedBox.id}__${itemSignature}`;

    const customSummary = selectedItems
      .map((item) => `${quantities[item.id]} ${item.name}`)
      .join(", ");

    const customQuantities = selectedItems.reduce((acc, item) => {
      acc[item.id] = quantities[item.id];
      return acc;
    }, {});

    return {
      id: customId,
      name: `Custom ${selectedBox.name}`,
      price: singleBoxPrice,
      formattedPrice: `₦${singleBoxPrice.toLocaleString()}`,
      image: selectedBox.image,
      serves: `${usedSlots}/${selectedBox.maxSlots} Slots`,
      tag: "Custom Box",
      customSummary,
      customBoxId: selectedBox.id,
      customQuantities,
      isCustom: true,
    };
  };

  const handleAddCustomBox = (target = "bag") => {
    if (selectedItems.length === 0) return;

    const customPkg = buildCustomPackagePayload();

    if (target === "giftbox") {
      addToGiftBox(customPkg, boxQuantity);
    } else {
      addToBag(customPkg, boxQuantity);
    }

    handleClearItems();
    setBoxQuantity(1);
    setSelectedBoxId(BOX_OPTIONS[0].id);
    navigate(target === "giftbox" ? "/giftbox" : "/bag");
  };

  const handleSaveCustomBox = () => {
    if (!editingItem || selectedItems.length === 0) return;

    const customPkg = buildCustomPackagePayload();
    setIsSaving(true);

    if (editTarget === "giftbox") {
      updateCustomGiftBoxItem(editingItem.id, customPkg, boxQuantity);
      navigate("/giftbox");
    } else {
      updateCustomBagItem(editingItem.id, customPkg, boxQuantity);
      navigate("/bag");
    }
  };

  const backCollectionPath = editTarget === "giftbox" ? "/giftbox" : "/bag";
  const backCollectionLabel = editTarget === "giftbox" ? "Gift Box" : "Bag";

  if (isEditMode && !editingItem && !isSaving) {
    return (
      <div className="custom-pkg-page" role="main">
        <section className="custom-pkg-main">
          <div className="custom-pkg-container">
            <div className="custom-edit-not-found">
              <h2>Custom Package Not Found</h2>
              <p>
                This custom package may have already been removed from your{" "}
                {backCollectionLabel.toLowerCase()}.
              </p>
              <div className="custom-edit-not-found-actions">
                <Link to={backCollectionPath} className="summary-add-bag-btn">
                  Back to {backCollectionLabel}
                </Link>
                <Link
                  to="/custom-package"
                  className="summary-add-gift-btn summary-cancel-link"
                >
                  Build a New Custom Box
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="custom-pkg-page" role="main">
      {/* Header Banner */}
      <section className="custom-pkg-hero">
        <div className="custom-pkg-container">
          <nav className="custom-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="breadcrumb-separator">/</span>
            {editingItem ? (
              <>
                <Link to={backCollectionPath} className="breadcrumb-link">
                  {backCollectionLabel}
                </Link>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">Edit Custom Box</span>
              </>
            ) : (
              <span className="breadcrumb-current">Custom Package</span>
            )}
          </nav>
          <span className="custom-eyebrow">
            {editingItem ? "EDIT CUSTOM PACKAGE" : "CUSTOM PACKAGE BUILDER"}
          </span>
          <h1 className="custom-title">
            {editingItem ? "Edit Your Custom Box" : "Build Your Custom Box"}
          </h1>
          <p className="custom-subtitle">
            {editingItem
              ? `Update your box size, items, or quantity and save the changes back to your ${backCollectionLabel.toLowerCase()}.`
              : "Pick a box size, choose the items you want inside, and add it to your bag or gift box."}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="custom-pkg-main">
        <div className="custom-pkg-container">
          <div className="custom-grid">
            {/* Left Column: Step 1 (Box) & Step 2 (Items) */}
            <div className="custom-selector-col">
              {/* Step 1: Select Box */}
              <div className="selector-section">
                <div className="selector-header">
                  <div className="step-heading-row">
                    <span className="step-pill">Step 1</span>
                    <h2 className="selector-title">Select Your Box Size</h2>
                  </div>
                  <p className="selector-desc">
                    Choose a box size based on how much you want to pack.
                    Larger items take more slots.
                  </p>
                </div>

                <div className="box-options-grid">
                  {BOX_OPTIONS.map((box) => {
                    const isSelected = box.id === selectedBox.id;
                    const isTooSmall = usedSlots > box.maxSlots;
                    return (
                      <button
                        key={box.id}
                        type="button"
                        className={`box-option-card ${
                          isSelected ? "active" : ""
                        } ${isTooSmall ? "disabled" : ""}`}
                        onClick={() => handleBoxSelect(box)}
                        disabled={isTooSmall}
                      >
                        <div className="box-option-img-wrap">
                          <img
                            src={box.image}
                            alt={box.name}
                            className="box-option-img"
                          />
                          <span className="box-slots-badge">
                            {box.maxSlots} Slots
                          </span>
                        </div>
                        <div className="box-option-body">
                          <div className="box-option-title-row">
                            <strong className="box-option-name">
                              {box.name}
                            </strong>
                            <span className="box-option-serves">
                              {box.serves}
                            </span>
                          </div>
                          <p className="box-option-desc">{box.description}</p>
                          {isTooSmall && (
                            <span className="box-too-small-note">
                              Current items use {usedSlots} slots
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Items */}
              <div className="selector-section">
                <div className="selector-header selector-header-with-action">
                  <div>
                    <div className="step-heading-row">
                      <span className="step-pill">Step 2</span>
                      <h2 className="selector-title">
                        Fill Your {selectedBox.name}
                      </h2>
                    </div>
                    <p className="selector-desc">
                      Select items to place inside your box up to{" "}
                      {selectedBox.maxSlots} slots.
                    </p>
                  </div>
                  {usedSlots > 0 && (
                    <button
                      type="button"
                      className="clear-items-btn"
                      onClick={handleClearItems}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Slot Capacity Bar & Visual Compartment Grid */}
                <div
                  className={`slot-meter-box ${
                    remainingSlots === 0 ? "full" : ""
                  }`}
                >
                  <div className="slot-meter-top">
                    <div className="slot-meter-counts">
                      <strong>
                        {usedSlots} / {selectedBox.maxSlots} slots used
                      </strong>
                      <span className="slot-remaining-label">
                        {remainingSlots === 0
                          ? "Box is full"
                          : `${remainingSlots} ${
                              remainingSlots === 1 ? "slot" : "slots"
                            } remaining`}
                      </span>
                    </div>
                  </div>

                  <div className="slot-progress-track" aria-hidden="true">
                    <div
                      className="slot-progress-fill"
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>

                  <div
                    className="slot-cells-grid"
                    aria-label={`${usedSlots} of ${selectedBox.maxSlots} slots filled`}
                  >
                    {Array.from({ length: selectedBox.maxSlots }).map(
                      (_, idx) => (
                        <span
                          key={idx}
                          className={`slot-cell ${
                            idx < usedSlots ? "filled" : ""
                          }`}
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="items-selector-list">
                  {SELECTABLE_ITEMS.map((item) => {
                    const count = quantities[item.id] || 0;
                    const canAddOne = item.slots <= remainingSlots;
                    return (
                      <div
                        key={item.id}
                        className={`item-selector-row ${
                          count > 0 ? "selected" : ""
                        } ${!canAddOne && count === 0 ? "out-of-space" : ""}`}
                      >
                        <div className="item-meta">
                          <div className="item-title-group">
                            <span className="item-name">{item.name}</span>
                            <span className="item-category-tag">
                              {item.category}
                            </span>
                          </div>
                          <div className="item-submeta">
                            <span className="item-slot-pill">
                              {item.slots}{" "}
                              {item.slots === 1 ? "slot" : "slots"}
                            </span>
                            <span className="item-price-label">
                              ₦{item.price.toLocaleString()} each
                            </span>
                          </div>
                        </div>

                        <div className="item-controls-right">
                          {count > 0 && (
                            <span className="item-line-usage">
                              {count * item.slots}{" "}
                              {count * item.slots === 1 ? "slot" : "slots"} • ₦
                              {(count * item.price).toLocaleString()}
                            </span>
                          )}

                          <div className="item-counter">
                            <button
                              type="button"
                              className="counter-btn minus-btn"
                              onClick={() => handleQtyChange(item, -1)}
                              disabled={count <= 0}
                              aria-label={`Decrease ${item.name}`}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              className="counter-input"
                              value={count}
                              onChange={(e) =>
                                handleDirectQty(item, e.target.value)
                              }
                              min="0"
                              aria-label={`${item.name} quantity`}
                            />
                            <button
                              type="button"
                              className="counter-btn plus-btn"
                              onClick={() => handleQtyChange(item, 1)}
                              disabled={!canAddOne}
                              title={
                                !canAddOne
                                  ? `Requires ${item.slots} slots (${remainingSlots} remaining)`
                                  : `Add ${item.name}`
                              }
                              aria-label={`Increase ${item.name}`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Custom Box Summary & Add to Bag */}
            <div className="custom-summary-col">
              <div className="summary-sticky-card">
                <div className="summary-header">
                  <span className="summary-tag">CUSTOM PACKAGE SUMMARY</span>
                  <h3 className="summary-title">{selectedBox.name}</h3>
                </div>

                {/* Selected Box Preview */}
                <div className="summary-box-preview">
                  <img
                    src={selectedBox.image}
                    alt={selectedBox.name}
                    className="summary-box-img"
                  />
                  <div className="summary-box-info">
                    <strong>{selectedBox.name}</strong>
                    <span>{selectedBox.serves}</span>
                    <span className="summary-slot-pill">
                      {usedSlots} / {selectedBox.maxSlots} slots filled
                    </span>
                  </div>
                </div>

                {/* Selected Items List */}
                <div className="summary-items-box">
                  {selectedItems.length === 0 ? (
                    <div className="empty-summary-prompt">
                      <span>Your box is empty</span>
                      <p>
                        Add items on the left to fill your {selectedBox.name}.
                      </p>
                    </div>
                  ) : (
                    <ul className="summary-items-list">
                      {selectedItems.map((item) => {
                        const qty = quantities[item.id];
                        const itemSlots = qty * item.slots;
                        const itemTotal = qty * item.price;
                        return (
                          <li key={item.id} className="summary-item-line">
                            <div className="summary-item-left">
                              <span className="summary-item-name">
                                {qty}x {item.name}
                              </span>
                              <span className="summary-item-slots">
                                {itemSlots}{" "}
                                {itemSlots === 1 ? "slot" : "slots"}
                              </span>
                            </div>
                            <span className="summary-item-price">
                              ₦{itemTotal.toLocaleString()}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Box Quantity & Price Breakdown */}
                <div className="summary-pricing-block">
                  <div className="box-qty-row">
                    <span className="box-qty-label">Number of Boxes</span>
                    <div className="item-counter">
                      <button
                        type="button"
                        className="counter-btn minus-btn"
                        onClick={() => setBoxQuantity((q) => Math.max(1, q - 1))}
                        disabled={boxQuantity <= 1}
                        aria-label="Decrease number of boxes"
                      >
                        −
                      </button>
                      <span className="box-qty-display">{boxQuantity}</span>
                      <button
                        type="button"
                        className="counter-btn plus-btn"
                        onClick={() => setBoxQuantity((q) => q + 1)}
                        aria-label="Increase number of boxes"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="summary-price-row">
                    <span>Price per Box</span>
                    <strong>₦{singleBoxPrice.toLocaleString()}</strong>
                  </div>

                  <div className="summary-total-row">
                    <span>Total Price</span>
                    <strong className="summary-grand-total">
                      ₦{totalOrderPrice.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="summary-actions">
                  {editingItem ? (
                    <>
                      <button
                        type="button"
                        className="summary-add-bag-btn"
                        onClick={handleSaveCustomBox}
                        disabled={selectedItems.length === 0}
                      >
                        <span>Save to {backCollectionLabel}</span>
                      </button>
                      <Link
                        to={backCollectionPath}
                        className="summary-add-gift-btn summary-cancel-link"
                      >
                        <span>Cancel</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="summary-add-bag-btn"
                        onClick={() => handleAddCustomBox("bag")}
                        disabled={selectedItems.length === 0}
                      >
                        <span>Add to Bag</span>
                      </button>
                      <button
                        type="button"
                        className="summary-add-gift-btn"
                        onClick={() => handleAddCustomBox("giftbox")}
                        disabled={selectedItems.length === 0}
                      >
                        <span>Add to Gift Box</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
