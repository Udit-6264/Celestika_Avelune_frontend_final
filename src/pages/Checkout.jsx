import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// Loads the Razorpay checkout script dynamically
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const { cartItems, itemsPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.name || "",

    phone: "",

    house: "",

    area: "",

    landmark: "",

    city: "",

    state: "",

    pincode: "",
  });

  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [checkingPincode, setCheckingPincode] = useState(false);

  // Admin-configurable shipping settings — fetched from backend instead of hardcoded
  const [shippingSettings, setShippingSettings] = useState({
    shippingCharge: 49,
    freeShippingThreshold: 999,
  });

  // COD is only offered if every item in the cart supports it
  const codEligible = cartItems.length > 0 && cartItems.every((item) => item.codAvailable);
  const [paymentMethod, setPaymentMethod] = useState("online"); // "online" | "cod"

  // Coupon
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountAmount }
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/auth/profile").then((res) => {
      if (res.data.address) {
        setAddress((prev) => ({ ...prev, ...res.data.address }));
      }
    });
  }, []);

  useEffect(() => {
    api.get("/settings").then((res) => {
      setShippingSettings({
        shippingCharge: res.data.shippingCharge,
        freeShippingThreshold: res.data.freeShippingThreshold,
      });
    });
  }, []);

  // If COD stops being eligible (e.g. cart changes), fall back to online
  useEffect(() => {
    if (!codEligible && paymentMethod === "cod") {
      setPaymentMethod("online");
    }
  }, [codEligible, paymentMethod]);


  const checkPincode = async () => {
    if (address.pincode.length !== 6) {
      setDeliveryInfo(null);
      setDeliveryAvailable(false);
      return;
    }

    try {
      setCheckingPincode(true);

      const { data } = await api.get(
        `/pincodes/check/${address.pincode}`
      );

      if (data.available) {
        setDeliveryAvailable(true);
        setDeliveryInfo(data);
        setAddress(prev => ({

          ...prev,

          city: data.city,

          state: data.state

        }));
      } else {
        setDeliveryAvailable(false);
        setDeliveryInfo({
          available: false,
        });
      }
    } catch (err) {
      setDeliveryAvailable(false);

      setDeliveryInfo({
        available: false,
      });
    } finally {
      setCheckingPincode(false);
    }
  };

  const shippingPrice =
    itemsPrice > shippingSettings.freeShippingThreshold ? 0 : shippingSettings.shippingCharge;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const totalPrice = Math.max(itemsPrice + shippingPrice - discountAmount, 0);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponError("");
    setCouponMessage("");
    setApplyingCoupon(true);
    try {
      const { data } = await api.post("/coupons/apply", {
        code: couponInput.trim(),
        cartTotal: itemsPrice,
      });
      setAppliedCoupon({ code: data.code, discountAmount: data.discountAmount });
      setCouponMessage(data.message);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || "Invalid coupon code");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponMessage("");
    setCouponError("");
  };

  const placeOrder = async (paymentResult = null) => {
    const orderItems = cartItems.map((i) => ({
      product: i.product,
      name: i.name,
      image: i.image,
      price: i.price,
      size: i.size,
      quantity: i.quantity,
    }));

    const { data } = await api.post("/orders", {
      orderItems,
      shippingAddress: address,
      paymentResult,
      paymentMethod: paymentMethod === "cod" ? "COD" : "Razorpay",
      itemsPrice,
      shippingPrice,
      couponCode: appliedCoupon?.code,
      discountAmount,
      totalPrice,

      estimatedDelivery: deliveryInfo?.estimatedDelivery,
    });

    clearCart();
    navigate(`/order-success/${data._id}`);
  };

  const handleCodOrder = async () => {
    if (!deliveryAvailable) {
      setError("Delivery is not available at this pincode.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await placeOrder(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order");
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!deliveryAvailable) {
      setError("Delivery is not available at this pincode.");
      return;
    }

    if (paymentMethod === "cod") {
      return handleCodOrder();
    }

    setError("");
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load payment gateway. Check your internet connection.");
        setLoading(false);
        return;
      }

      // 1. Create Razorpay order on backend
      // Backend response shape: { success, order: { id, amount, currency, ... }, key_id }
      const { data: razorRes } = await api.post("/payment/create-order", { amount: totalPrice });
      const razorOrder = razorRes.order;

      if (!razorOrder || !razorOrder.id) {
        setError("Could not create payment order. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Open Razorpay checkout
      const options = {
        key: razorRes.key_id,
        amount: razorOrder.amount,
        currency: razorOrder.currency,
        name: "Celestika Avelune",
        description: "Order Payment",
        order_id: razorOrder.id,
        prefill: {
          name: address.fullName,
          contact: address.phone,
          email: user?.email,
        },
        theme: { color: "#d63384" },
        handler: async (response) => {
          try {
            // 3. Verify payment signature
            const { data: verifyRes } = await api.post("/payment/verify", response);
            if (verifyRes.verified) {
              await placeOrder(response);
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            setError("Something went wrong after payment. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Could not initiate payment");
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2>Checkout</h2>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handlePayment}>
          <h3>Shipping Address</h3>
          {error && <p className="error-text">{error}</p>}
          <input
            placeholder="Full Name"
            required
            value={address.fullName}
            onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
          />
          <input
            placeholder="Phone Number"
            required
            value={address.phone}
            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
          />
          <input
            placeholder="House / Flat No."
            required
            value={address.house}
            onChange={(e) =>
              setAddress({
                ...address,
                house: e.target.value
              })
            }
          />

          <input
            placeholder="Area / Locality"
            required
            value={address.area}
            onChange={(e) =>
              setAddress({
                ...address,
                area: e.target.value
              })
            }
          />

          <input
            placeholder="Landmark (Optional)"
            value={address.landmark}
            onChange={(e) =>
              setAddress({
                ...address,
                landmark: e.target.value
              })
            }
          />
          <input
            placeholder="City"
            value={address.city}
            readOnly
            className="readonly-input"
          />
          <input
            placeholder="State"
            value={address.state}
            readOnly
            className="readonly-input"
          />
          <input
            type="text"
            placeholder="Enter 6-digit Pincode"
            maxLength={6}
            required
            value={address.pincode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");

              setAddress({
                ...address,
                pincode: value,
              });

              // Reset delivery info while typing
              setDeliveryInfo(null);
              setDeliveryAvailable(false);
            }}
            onBlur={checkPincode}
          />
          <button
            type="button"
            className="check-pincode-btn"
            onClick={checkPincode}
            disabled={checkingPincode || address.pincode.length !== 6}
          >
            {checkingPincode ? "Checking..." : "Check Availability"}
          </button>

          {deliveryInfo && (
            <div
              className={
                deliveryInfo.available
                  ? "delivery-success"
                  : "delivery-failed"
              }
            >
              {deliveryInfo.available ? (
                <>
                  <p>✅ Delivery Available</p>

                  <p>
                    <strong>City:</strong> {deliveryInfo.city}
                  </p>

                  <p>
                    <strong>State:</strong> {deliveryInfo.state}
                  </p>

                  <p>
                    <strong>Estimated Delivery:</strong>{" "}
                    {new Date(
                      deliveryInfo.estimatedDelivery
                    ).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </>
              ) : (
                <p>❌ Sorry! Delivery is not available at this pincode.</p>
              )}
            </div>
          )}

          <h3 style={{ marginTop: "24px" }}>Payment Method</h3>
          <div className="payment-method-options">
            <label className={paymentMethod === "online" ? "payment-method-pill active" : "payment-method-pill"}>
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
              />
              💳 Pay Online (Razorpay)
            </label>

            <label
              className={
                !codEligible
                  ? "payment-method-pill disabled"
                  : paymentMethod === "cod"
                    ? "payment-method-pill active"
                    : "payment-method-pill"
              }
              title={!codEligible ? "One or more items in your cart don't support Cash on Delivery" : ""}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "cod"}
                disabled={!codEligible}
                onChange={() => setPaymentMethod("cod")}
              />
              💵 Cash on Delivery
            </label>
          </div>
          {!codEligible && (
            <p className="cod-note">
              Cash on Delivery isn't available for one or more items in your cart.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !deliveryAvailable}
            className={!deliveryAvailable ? "disabled-payment-btn" : ""}
          >
            {loading
              ? "Processing..."
              : paymentMethod === "cod"
                ? `Place Order (Pay ₹${totalPrice} on Delivery)`
                : `Pay ₹${totalPrice} with Razorpay`}
          </button>
        </form>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          {cartItems.map((item, i) => (
            <div className="summary-row" key={i}>
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
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

          <div className="coupon-section">
            {!appliedCoupon ? (
              <div className="coupon-input-row">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponInput.trim()}
                >
                  {applyingCoupon ? "Applying..." : "Apply"}
                </button>
              </div>
            ) : (
              <div className="coupon-applied-row">
                <span>
                  🎟️ <b>{appliedCoupon.code}</b> applied
                </span>
                <button type="button" onClick={handleRemoveCoupon}>
                  Remove
                </button>
              </div>
            )}
            {couponMessage && <p className="coupon-success-text">{couponMessage}</p>}
            {couponError && <p className="coupon-error-text">{couponError}</p>}
          </div>

          {discountAmount > 0 && (
            <div className="summary-row discount-row">
              <span>Coupon Discount</span>
              <span>−₹{discountAmount}</span>
            </div>
          )}

          <div className="summary-row total">
            <span>Total</span>
            <span>₹{totalPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;