import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AccountGuard from "../../components/AccountGuard";
import "./Account.css";

function getDeliveryTag(order) {
  if (order.orderType === "giftbox") {
    return { label: "Gift", className: "tag-gift" };
  }
  if (order.fulfillment === "pickup") {
    return { label: "Pick-Up", className: "tag-pickup" };
  }
  return { label: "Delivery", className: "tag-delivery" };
}

function OrdersContent() {
  const { orders } = useAuth();

  return (
    <div className="account-page">
      <div className="account-container">
        {/* Page Header */}
        <div className="account-header">
          <h1 className="account-title">Order History</h1>
          <p className="account-subtitle">
            Review your past purchases and track order details.
          </p>
        </div>

        {/* Orders List or Empty State */}
        {!orders || orders.length === 0 ? (
          <div className="account-empty-state">
            <div className="account-empty-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="36"
                height="36"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h2 className="account-empty-title">No orders placed yet</h2>
            <p className="account-empty-subtitle">
              When you place an order, its complete receipt and fulfillment
              details will be listed here.
            </p>
            <Link to="/menu" className="btn-account-primary">
              Explore Our Menu
            </Link>
          </div>
        ) : (
          <div className="order-history-list">
            {orders.map((order) => {
              const itemCount = (order.items || []).reduce(
                (sum, it) => sum + (it.quantity || 1),
                0
              );
              const deliveryTag = getDeliveryTag(order);

              return (
                <div key={order.orderId} className="order-history-card">
                  {/* Top Meta Line: Order ID, Date, Badges */}
                  <div className="order-row-top">
                    <div className="order-row-id-group">
                      <span className="order-row-id">#{order.orderId}</span>
                      <span className="order-row-bullet" aria-hidden="true">
                        •
                      </span>
                      <span className="order-row-date">{order.date}</span>
                    </div>

                    <div className="order-row-badges">
                      <span
                        className={`order-type-badge ${deliveryTag.className}`}
                      >
                        {deliveryTag.label}
                      </span>
                      <span className="order-status-badge">
                        {order.paymentStatus || "Paid"}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Items Summary */}
                  <div className="order-row-items">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="order-item-line">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="order-item-img"
                          />
                        )}
                        <div className="order-item-info">
                          <strong className="order-item-title">
                            {item.name}
                          </strong>
                          <div className="order-item-sub">
                            <span>Qty: {item.quantity || 1}</span>
                            {item.serves && <span>• {item.serves}</span>}
                            {item.price && (
                              <span>
                                • ₦{(item.price * (item.quantity || 1)).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom: Destination, Total & View Details Action */}
                  <div className="order-row-bottom">
                    <div className="order-row-destination">
                      <span className="order-dest-caption">
                        {order.fulfillment === "pickup"
                          ? "Fulfillment"
                          : "Delivering to"}
                      </span>
                      <span className="order-dest-text">
                        {order.fulfillment === "pickup"
                          ? "Store Pick-up (Pius Alile Shopping Mall, UNIBEN)"
                          : order.deliveryAddress ||
                            order.coordinates ||
                            "Benin City"}
                      </span>
                    </div>

                    <div className="order-row-action-group">
                      <div className="order-row-total-block">
                        <span className="order-total-caption">
                          Total ({itemCount} item{itemCount === 1 ? "" : "s"})
                        </span>
                        <strong className="order-total-amount">
                          ₦{(order.grandTotal || 0).toLocaleString()}
                        </strong>
                      </div>

                      <Link
                        to={`/account/orders/${order.orderId}`}
                        className="btn-order-details-link"
                      >
                        <span>View Details</span>
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Orders() {
  return (
    <AccountGuard>
      <OrdersContent />
    </AccountGuard>
  );
}
