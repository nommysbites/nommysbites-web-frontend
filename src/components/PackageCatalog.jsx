import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  packagesData,
  menuCategories,
  portionSizes,
  sortOptions,
} from "../data/packagesData";
import { useCart } from "../context/CartContext";
import PackageCard from "./PackageCard";
import "../pages/Menu.css";

/**
 * Shared catalog layout powering both Menu (/menu) and Gift (/gift).
 */
export default function PackageCatalog({ mode = "menu" }) {
  const isGift = mode === "gift";
  const { addToBag, addToGiftBox } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPortion, setSelectedPortion] = useState("All");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [selectedSort, setSelectedSort] = useState("popular");
  const [quantities, setQuantities] = useState({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileFilterClosing, setIsMobileFilterClosing] = useState(false);

  const openMobileFilter = () => {
    setIsMobileFilterOpen(true);
    setIsMobileFilterClosing(false);
  };

  const closeMobileFilter = useCallback(() => {
    if (isMobileFilterClosing || !isMobileFilterOpen) return;
    setIsMobileFilterClosing(true);
    setTimeout(() => {
      setIsMobileFilterOpen(false);
      setIsMobileFilterClosing(false);
    }, 280);
  }, [isMobileFilterClosing, isMobileFilterOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mode]);

  useEffect(() => {
    if (!isMobileFilterOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeMobileFilter();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileFilterOpen, closeMobileFilter]);

  const handleQuantityChange = (id, delta) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const updated = Math.max(1, current + delta);
      return { ...prev, [id]: updated };
    });
  };

  const handleAdd = (pkg, qty) => {
    if (isGift) {
      addToGiftBox(pkg, qty);
    } else {
      addToBag(pkg, qty);
    }
    setQuantities((prev) => ({ ...prev, [pkg.id]: 1 }));
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedPortion("All");
    setMaxPrice(100000);
    setSelectedSort("popular");
  };

  const categoryCounts = useMemo(() => {
    const counts = { all: packagesData.length };
    packagesData.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredPackages = useMemo(() => {
    return packagesData
      .filter((pkg) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = pkg.name.toLowerCase().includes(q);
          const matchDesc = pkg.shortDescription.toLowerCase().includes(q);
          const matchCat = pkg.categoryLabel.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        if (selectedCategory !== "all" && pkg.category !== selectedCategory) {
          return false;
        }

        if (selectedPortion !== "All" && pkg.portionSize !== selectedPortion) {
          return false;
        }

        if (pkg.price > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (selectedSort === "price-asc") return a.price - b.price;
        if (selectedSort === "price-desc") return b.price - a.price;
        if (selectedSort === "rating")
          return Number(b.rating) - Number(a.rating);
        return 0;
      });
  }, [searchQuery, selectedCategory, selectedPortion, maxPrice, selectedSort]);

  const pageTitle = isGift ? "Gift Items" : "Menu";
  const pageSubtitle = isGift
    ? `${filteredPackages.length} ${filteredPackages.length === 1 ? "item" : "items"} you can send as a gift`
    : `${filteredPackages.length} ${filteredPackages.length === 1 ? "item" : "items"} available for order`;

  return (
    <div className="menu-page">
      {/* Top Banner / Breadcrumb Header */}
      <header className="menu-header-section">
        <div className="menu-header-container">
          <nav className="menu-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">
              {isGift ? "Gift" : "Menu"}
            </span>
          </nav>

          <div className="menu-header-row">
            <div className="menu-header-text">
              <h1 className="menu-title">{pageTitle}</h1>
              <p className="menu-subtitle">{pageSubtitle}</p>
            </div>

            {/* Search Bar */}
            <div className="menu-search-wrapper">
              <div className="menu-search-bar">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="search-icon"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  aria-label={
                    isGift ? "Search gift items" : "Search menu items"
                  }
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="search-clear-btn"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
                <button type="button" className="search-submit-btn">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout: Sidebar + Package Grid */}
      <div className="menu-main-container">
        <div className="menu-layout-grid">
          {/* Left Column: Filters Sidebar */}
          <aside
            className={`menu-filters-sidebar ${isMobileFilterOpen ? "mobile-open" : ""} ${isMobileFilterClosing ? "mobile-closing" : ""}`}
            aria-label={isGift ? "Gift filters" : "Menu filters"}
            onClick={closeMobileFilter}
          >
            <div
              className={`filters-card ${isMobileFilterClosing ? "closing" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="filters-header">
                <div className="filters-header-title-wrap">
                  <h3 className="filters-title">Filters</h3>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="filters-clear-btn"
                  >
                    Clear all
                  </button>
                </div>
                <button
                  type="button"
                  className="mobile-filter-close-btn"
                  onClick={closeMobileFilter}
                  aria-label="Close filters"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              {/* Categories */}
              <div className="filter-group">
                <h4 className="filter-group-title">Category</h4>
                <div className="filter-options-list">
                  {menuCategories.map((cat) => (
                    <label key={cat.id} className="filter-radio-label">
                      <input
                        type="radio"
                        name={`category-${mode}`}
                        value={cat.id}
                        checked={selectedCategory === cat.id}
                        onChange={() => setSelectedCategory(cat.id)}
                        className="filter-radio-input"
                      />
                      <span className="filter-radio-custom" />
                      <span className="filter-label-text">{cat.label}</span>
                      <span className="filter-count">
                        ({categoryCounts[cat.id] || 0})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="filter-group">
                <div className="filter-group-header">
                  <h4 className="filter-group-title">Price Range</h4>
                  <span className="filter-price-display">
                    Up to ₦{maxPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="100000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="filter-price-slider"
                  aria-label="Maximum price filter"
                />
                <div className="price-slider-labels">
                  <span>₦1,200</span>
                  <span>₦100,000</span>
                </div>
              </div>

              {/* Portion Size Pills */}
              <div className="filter-group">
                <h4 className="filter-group-title">Portion Size</h4>
                <div className="portion-pills-row">
                  {portionSizes.map((portion) => (
                    <button
                      key={portion}
                      type="button"
                      onClick={() => setSelectedPortion(portion)}
                      className={`portion-pill-btn ${selectedPortion === portion ? "active" : ""}`}
                    >
                      {portion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Close Button */}
              <button
                type="button"
                className="mobile-apply-btn"
                onClick={closeMobileFilter}
              >
                Apply Filters ({filteredPackages.length})
              </button>
            </div>
          </aside>

          {/* Right Column: Products & Sort Bar */}
          <main className="menu-products-column">
            {/* Top Toolbar */}
            <div className="menu-toolbar">
              <div className="menu-toolbar-controls">
                {/* Mobile Filter Trigger Button */}
                <button
                  type="button"
                  className="mobile-filter-trigger"
                  onClick={openMobileFilter}
                  aria-label="Open filter sidebar"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" x2="20" y1="21" y2="21" />
                    <line x1="4" x2="20" y1="14" y2="14" />
                    <line x1="4" x2="20" y1="7" y2="7" />
                    <circle cx="9" cy="7" r="2" />
                    <circle cx="15" cy="14" r="2" />
                    <circle cx="9" cy="21" r="2" />
                  </svg>
                  <span>Filters</span>
                </button>

                {/* Sort Dropdown */}
                <div className="menu-sort-wrap">
                  <label htmlFor={`sort-${mode}`} className="sort-label">
                    Sort by:
                  </label>
                  <select
                    id={`sort-${mode}`}
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="sort-select"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Packages Grid */}
            {filteredPackages.length > 0 ? (
              <div className="menu-packages-grid">
                {filteredPackages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    quantity={quantities[pkg.id] || 1}
                    onQuantityChange={handleQuantityChange}
                    onAddToBag={handleAdd}
                    detailBasePath={isGift ? "/gift" : "/menu"}
                    isGift={isGift}
                  />
                ))}
              </div>
            ) : (
              <div className="menu-empty-state">
                <h3 className="empty-title">No Items Found</h3>
                <p className="empty-desc">
                  We couldn&apos;t find any item matching your current search
                  or filter selection.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="empty-reset-btn"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

