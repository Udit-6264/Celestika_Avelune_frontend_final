import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, itemsPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingSettings, setShippingSettings] = useState({
    shippingCharge: 49,
    freeShippingThreshold: 999,
  });

  useEffect(() => {
    api.get("/settings").then((res) => {
      setShippingSettings({
        shippingCharge: res.data.shippingCharge,
        freeShippingThreshold: res.data.freeShippingThreshold,
      });
    });
  }, []);

  const shippingPrice =
    itemsPrice > shippingSettings.freeShippingThreshold ? 0 : shippingSettings.shippingCharge;

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-container">
        <h2>Your Cart</h2>
        <p className="empty-note">Your cart is empty. <Link to="/">Continue shopping</Link></p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2>Your Cart</h2>
      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map((item, i) => (
            <div className="cart-item" key={i}>
              <img src={item.image} alt={item.name} />
              <div className="cart-item-info">
                <p>{item.name} {item.size && `(${item.size})`}</p>
                <p>₹{item.price}</p>
                <div className="qty-select">
                  <label>Qty:</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.product, item.size, Number(e.target.value))}
                  />
                </div>
              </div>
              <button className="remove-btn" onClick={() => removeFromCart(item.product, item.size)}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{itemsPrice}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shippingPrice === 0 ? "Free" : `₹${shippingPrice}`}</span>
          </div>

          {shippingPrice > 0 ? (
            <p className="free-shipping-hint">
              Add <b>₹{shippingSettings.freeShippingThreshold - itemsPrice}</b> more to get{" "}
              <b>free shipping</b>
            </p>
          ) : (
            <p className="free-shipping-hint free-shipping-hint-success">
              🎉 You've unlocked free shipping!
            </p>
          )}

          <p className="free-shipping-note">
            No shipping charge above ₹{shippingSettings.freeShippingThreshold}
          </p>

          <div className="summary-row total">
            <span>Total</span>
            <span>₹{itemsPrice + shippingPrice}</span>
          </div>
          <button className="btn-primary" onClick={handleCheckout}>Proceed to Checkout</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;