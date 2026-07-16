import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data));
  }, [id]);

  return (
    <div className="page-container order-success">
      <div className="success-icon">✓</div>
      <h2>Order Placed Successfully!</h2>
      <p>Thank you for shopping with Bloom & Belle. A confirmation email has been sent to you.</p>
      {order && (
        <p>Order ID: <b>#{order._id.slice(-8).toUpperCase()}</b> • Total: <b>₹{order.totalPrice}</b></p>
      )}
      <div className="success-actions">
        <Link to="/orders" className="btn-primary">View My Orders</Link>
        <Link to="/" className="btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
