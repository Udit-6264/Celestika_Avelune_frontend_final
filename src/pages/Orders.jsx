import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const statusColor = {
  Placed: "#f39c12",
  Processing: "#3498db",
  Shipped: "#9b59b6",
  "Out for Delivery": "#00bcd4",
  Delivered: "#27ae60",
  Cancelled: "#e74c3c",
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/my-orders").then((res) => {
      setOrders(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <h2>My Orders</h2>
        <div className="orders-list-v2">
          {[1, 2].map((i) => (
            <div className="order-card-v2 skeleton" key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <div className="empty-orders">
          <p className="empty-note">You haven't placed any orders yet.</p>
          <Link to="/" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list-v2">
          {orders.map((order) => {
            const addr = order.shippingAddress || {};
            const firstItem = order.orderItems[0];
            const extraCount = order.orderItems.length - 1;

            return (
              <div className="order-card-v2" key={order._id}>
                <span
                  className="order-card-v2-status"
                  style={{ backgroundColor: statusColor[order.orderStatus] }}
                >
                  {order.orderStatus}
                </span>

                <div className="order-card-v2-top">
                  <img
                    src={firstItem?.image}
                    alt={firstItem?.name}
                    className="order-card-v2-thumb"
                  />
                  <div>
                    <p className="order-card-v2-id">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="order-card-v2-items-name">
                      {firstItem?.name}
                      {extraCount > 0 && ` +${extraCount} more`}
                    </p>
                    <p className="order-card-v2-meta">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="order-card-v2-details">
                  <p className="order-card-v2-meta">
                    <b>{addr.fullName || user?.name}</b> · {addr.phone}
                  </p>
                  <p className="order-card-v2-meta">
                    {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>

                <div className="order-card-v2-footer">
                  <div className="order-card-v2-footer-info">
                    <span>{order.orderItems.length} item(s)</span>
                    <span className="dot">•</span>
                    <span>₹{order.totalPrice}</span>
                  </div>
                  <Link to={`/track-order/${order._id}`} className="order-card-v2-track">
                    Track Order →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;