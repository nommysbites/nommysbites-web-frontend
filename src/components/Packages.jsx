import { useState } from "react";
import { Link } from "react-router-dom";
import { featuredPackages } from "../data/packagesData";
import { useCart } from "../context/CartContext";
import PackageCard from "./PackageCard";
import "./Packages.css";

export default function Packages() {
  const { addToBag } = useCart();
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (id, delta) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const updated = Math.max(1, current + delta);
      return { ...prev, [id]: updated };
    });
  };

  const handleAddToBag = (pkg, qty) => {
    addToBag(pkg, qty);
    setQuantities((prev) => ({ ...prev, [pkg.id]: 1 }));
  };

  return (
    <section
      className="packages-section"
      id="packages"
      aria-label="Our Featured Products"
    >
      <div className="packages-container">
        {/* Section Header */}
        <div className="packages-header">
          <span className="packages-eyebrow">POPULAR ORDERS</span>
          <h2 className="packages-title">Customer Favorites</h2>
          <p className="packages-subtitle">
            Pick a box you like, or build your own if you want something
            specific.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="packages-grid">
          {featuredPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              quantity={quantities[pkg.id] || 1}
              onQuantityChange={handleQuantityChange}
              onAddToBag={handleAddToBag}
            />
          ))}
        </div>

        {/* View All Packages CTA Link */}
        <div className="packages-view-all-wrap">
          <Link to="/menu" className="packages-view-all-btn">
            <span>View Full Menu</span>
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="btn-arrow-icon"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
