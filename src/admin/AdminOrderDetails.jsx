import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";

const statuses = ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadingLabel, setDownloadingLabel] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);

  const [shipment, setShipment] = useState({
    courierPartner: "Delhivery",
    awbNumber: "",
    trackingId: "",
    trackingUrl: "",
    estimatedDelivery: "",
  });

  const loadOrder = () => {
    api.get(`/orders/${id}`).then((res) => {
      setOrder(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleStatusChange = async (status) => {
    if (status === "Shipped") {
      setShowShipmentModal(true);
      return;
    }

    await api.put(`/orders/${id}/status`, {
      status,
    });

    loadOrder();
  };

  const handleReturnStatusChange = async (requestId, status) => {
    await api.put(`/orders/${id}/return/${requestId}/status`, { status });
    loadOrder();
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 1200);
    } catch (err) {
      // ignore
    }
  };

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/orders/${id}/invoice`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([res.data], {
          type: "application/pdf",
        })
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${order._id.slice(-8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadShippingLabel = async () => {
    setDownloadingLabel(true);
    try {
      const res = await api.get(`/orders/${id}/shipping-label`, {
        responseType: "text",
      });

      const printWindow = window.open("", "_blank");

      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(res.data);
        printWindow.document.close();
      } else {
        alert("Popup blocked! Please allow popups for this website.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load shipping label. Check backend console.");
    } finally {
      setDownloadingLabel(false);
    }
  };

  const handleShipOrder = async () => {
    try {
      await api.put(`/orders/${id}/ship`, shipment);
      setShowShipmentModal(false);
      loadOrder();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to ship order");
    }
  };

  if (loading) return <p>Loading order...</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div className="admin-order-details">
      <Link to="/admin/orders" className="back-link">← Back to All Orders</Link>
      <h2>Order #{order._id.slice(-8).toUpperCase()}</h2>
      <p className="order-full-id">Full Order ID: {order._id}</p>

      <div className="admin-order-grid">
        {/* Customer & Shipping */}
        <section className="admin-order-card customer-card">
          <h3>👤 Customer Details</h3>
          <div className="customer-info">
            <div className="customer-row">
              <span>Customer Name</span>
              <strong>{order.user?.name}</strong>
            </div>
            <div className="customer-row">
              <span>Email</span>
              <strong>{order.user?.email}</strong>
            </div>
            <div className="customer-row">
              <span>Phone</span>
              <strong>{order.shippingAddress?.phone}</strong>
            </div>
          </div>

          <hr />

          <h3>📦 Shipping Address</h3>
          <div className="shipping-address-box">
            <p>
              <strong>{order.shippingAddress?.fullName}</strong>
            </p>
            <p>
              {[
                order.shippingAddress?.house,
                order.shippingAddress?.area,
                order.shippingAddress?.landmark,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p>
              {order.shippingAddress?.city},{" "}
              {order.shippingAddress?.state}
              {" - "}
              {order.shippingAddress?.pincode}
            </p>
          </div>

          <div className="customer-actions">
            <button
              onClick={() =>
                copyToClipboard(
                  `${order.shippingAddress?.house}, ${order.shippingAddress?.area}, ${order.shippingAddress?.landmark}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}`,
                  "address"
                )
              }
            >
              📋 Copy Address
            </button>
            <a href={`tel:${order.shippingAddress?.phone}`}>📞 Call</a>
            <a href={`mailto:${order.user?.email}`}>📧 Email</a>
          </div>
        </section>

        {/* Payment */}
        <section className="admin-order-card payment-card">
          <h3>💳 Payment Summary</h3>
          <div className="payment-status-row">
            <span className={order.isPaid ? "pay-status paid" : "pay-status unpaid"}>
              {order.isPaid ? "✔ Paid" : "✖ Unpaid"}
            </span>
            <span className="payment-amount">₹{order.totalPrice}</span>
          </div>

          <div className="payment-details">
            <div className="payment-item">
              <span>Gateway</span>
              <strong>Razorpay</strong>
            </div>
            <div className="payment-item">
              <span>Method</span>
              <strong>{order.paymentMethod}</strong>
            </div>
            <div className="payment-item">
              <span>Currency</span>
              <strong>INR (₹)</strong>
            </div>
            <div className="payment-item">
              <span>Paid On</span>
              <strong>
                {order.paidAt ? new Date(order.paidAt).toLocaleString("en-IN") : "-"}
              </strong>
            </div>
          </div>

          <hr />

          {order.paymentResult?.razorpay_payment_id && (
            <div className="txn-row">
              <label>Transaction ID</label>
              <div className="txn-value">
                <code>{order.paymentResult.razorpay_payment_id}</code>
                <button
                  onClick={() =>
                    copyToClipboard(order.paymentResult.razorpay_payment_id, "payment")
                  }
                >
                  {copiedField === "payment" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {order.paymentResult?.razorpay_order_id && (
            <div className="txn-row">
              <label>Razorpay Order ID</label>
              <div className="txn-value">
                <code>{order.paymentResult.razorpay_order_id}</code>
                <button
                  onClick={() =>
                    copyToClipboard(order.paymentResult.razorpay_order_id, "order")
                  }
                >
                  {copiedField === "order" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {/* ✅ Added: Razorpay Signature Row */}
          {order.paymentResult?.razorpay_signature && (
            <div className="txn-row">
              <label>Razorpay Signature</label>
              <div className="txn-value">
                <code>{order.paymentResult.razorpay_signature.slice(0, 20)}...</code>
                <button
                  onClick={() =>
                    copyToClipboard(order.paymentResult.razorpay_signature, "signature")
                  }
                >
                  {copiedField === "signature" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
            <button style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#afedd3",
              color: "#334155",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "background 0.2s"
            }}
              className="invoice-download-btn"
              onClick={handleDownloadInvoice}
              disabled={downloading}
            >
              📄 {downloading ? "Preparing Invoice..." : "Download Invoice"}
            </button>

            <button
              className="label-download-btn"
              onClick={handleDownloadShippingLabel}
              disabled={downloadingLabel}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#afedd3",
                color: "#334155",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "background 0.2s"
              }}
            >
              📦 {downloadingLabel ? "Preparing Label..." : "Download Shipping Label"}
            </button>
          </div>
        </section>

        {/* Amount Breakdown */}
        <section className="admin-order-card amount-card">
          <h3>🧾 Order Summary</h3>
          <div className="amount-row">
            <span>Items Total</span>
            <strong>₹{order.itemsPrice}</strong>
          </div>
          <div className="amount-row">
            <span>Shipping Charge</span>
            <strong>{order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice}`}</strong>
          </div>

          {order.discountAmount > 0 && (
            <div className="amount-row discount">
              <span>Coupon Discount</span>
              <strong>-₹{order.discountAmount}</strong>
            </div>
          )}

          <hr />

          <div className="amount-row grand-total">
            <span>Grand Total</span>
            <strong>₹{order.totalPrice}</strong>
          </div>
        </section>

        {/* Status */}
        <section className="admin-order-card">
          <h3>Order Status</h3>
          <select value={order.orderStatus} onChange={(e) => handleStatusChange(e.target.value)}>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {order.orderStatus === "Shipped" && order.shipmentDetails && (
            <div style={{ marginTop: "15px", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <p style={{ margin: "4px 0", color: "#475569" }}><b>Courier Partner:</b> {order.shipmentDetails.courierPartner}</p>
              <p style={{ margin: "4px 0", color: "#475569" }}><b>AWB Number:</b> {order.shipmentDetails.awbNumber}</p>
            </div>
          )}

          {order.trackingHistory?.length > 0 && (
            <div className="order-timeline">
              {statuses
                .filter((status) => status !== "Cancelled")
                .map((status) => {
                  const history = order.trackingHistory?.find((h) => h.status === status);
                  const completed = !!history;

                  return (
                    <div
                      key={status}
                      className={`timeline-step ${completed ? "completed" : ""}`}
                    >
                      <div className="timeline-circle">{completed ? "✓" : ""}</div>
                      <div className="timeline-content">
                        <h4>{status}</h4>
                        <p>
                          {history
                            ? new Date(history.date).toLocaleString("en-IN")
                            : "Pending"}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>

        {/* Items */}
        <section className="admin-order-card">
          <h3>Items</h3>
          <table className="admin-table">
            <thead>
              <tr>
                {/* ✅ Added: Order ID Column */}
                <th>Order ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item, i) => (
                <tr key={i}>
                  {/* ✅ Added: Order ID Cell Data */}
                  <td style={{ fontSize: "12px", fontFamily: "monospace" }}>{order._id}</td>
                  <td>
                    <img src={item.image} alt={item.name} className="admin-thumb" />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.size || "-"}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Return Requests */}
        {order.returnRequests && order.returnRequests.length > 0 && (
          <section className="admin-order-card">
            <h3>Return / Exchange Requests</h3>
            {order.returnRequests.map((req) => (
              <div className="return-request-row" key={req._id}>
                <div>
                  <p><b>{req.name}</b> — {req.type}</p>
                  {req.reason && <p className="return-request-reason">Reason: {req.reason}</p>}
                </div>
                <div className="return-request-actions">
                  <span className={`return-badge ${req.status.toLowerCase()}`}>{req.status}</span>
                  {req.status === "Requested" && (
                    <>
                      <button onClick={() => handleReturnStatusChange(req._id, "Approved")}>
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* Shipment Modal */}
      {showShipmentModal && (
        <div className="modal-overlay">
          <div className="ship-modal">
            <h2>🚚 Ship Order Details</h2>
            <div className="form-group">
              <label>Courier Partner</label>
              <select
                value={shipment.courierPartner}
                onChange={(e) => setShipment({ ...shipment, courierPartner: e.target.value })}
              >
                <option value="Delhivery">Delhivery</option>
                <option value="Blue Dart">Blue Dart</option>
                <option value="DTDC">DTDC</option>
                <option value="India Post">India Post</option>
                <option value="Ecom Express">Ecom Express</option>
                <option value="Xpressbees">Xpressbees</option>
              </select>
            </div>

            <div className="form-group">
              <label>AWB Number</label>
              <input
                type="text"
                placeholder="Enter AWB Number"
                value={shipment.awbNumber}
                onChange={(e) => setShipment({ ...shipment, awbNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Tracking ID</label>
              <input
                type="text"
                placeholder="Enter Tracking ID (Optional)"
                value={shipment.trackingId}
                onChange={(e) => setShipment({ ...shipment, trackingId: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Tracking URL</label>
              <input
                type="text"
                placeholder="Custom Tracking URL (Optional)"
                value={shipment.trackingUrl}
                onChange={(e) => setShipment({ ...shipment, trackingUrl: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Estimated Delivery Date</label>
              <input
                type="date"
                value={shipment.estimatedDelivery}
                onChange={(e) => setShipment({ ...shipment, estimatedDelivery: e.target.value })}
              />
            </div>

            <div className="modal-buttons">
              <button onClick={() => setShowShipmentModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleShipOrder} className="submit-btn">
                Confirm & Ship Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetails;