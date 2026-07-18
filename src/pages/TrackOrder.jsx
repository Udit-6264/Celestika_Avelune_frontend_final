import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.js";

const steps = ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

const statusBadgeClass = {
  Requested: "return-badge requested",
  Approved: "return-badge approved",
  Rejected: "return-badge rejected",
  Completed: "return-badge completed",
};

const TrackOrder = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Return / Exchange modal state
  const [modalItem, setModalItem] = useState(null);
  const [requestType, setRequestType] = useState("Return");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  const loadOrder = () => {
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err.response?.data?.message || "Order not found"));
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/orders/${id}/invoice`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${order._id.slice(-8).toUpperCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Could not download invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      await api.post(`/orders/${id}/cancel`);
      loadOrder();
    } catch (err) {
      alert(err.response?.data?.message || "Could not cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const openRequestModal = (item) => {
    setModalItem(item);

    const policy = item.product?.returnPolicy;
    if (policy && !policy.isReturnable && policy.isExchangeable) {
      setRequestType("Exchange");
    } else {
      setRequestType("Return");
    }

    setReason("");
    setRequestError("");
  };

  const closeModal = () => {
    setModalItem(null);
    setRequestError("");
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    setRequestError("");
    setSubmitting(true);
    try {
      await api.post(`/orders/${id}/return`, {
        product: modalItem.product._id || modalItem.product,
        type: requestType,
        reason,
      });
      setRequestSuccess(`${requestType} request submitted successfully.`);
      setModalItem(null);
      loadOrder();
      setTimeout(() => setRequestSuccess(""), 3000);
    } catch (err) {
      setRequestError(err.response?.data?.message || "Could not submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const getRequestForItem = (productId) => {
    if (!order?.returnRequests) return null;
    const matches = order.returnRequests.filter((r) => r.product === productId || r.product?._id === productId);
    return matches.length > 0 ? matches[matches.length - 1] : null;
  };

  // 💡 हेल्पर फंक्शन: चेक करेगा कि रिटर्न पीरियड वैलिड है या एक्सपायर हो चुका है
  const checkReturnWindowValidity = (deliveredAt, policy) => {
    if (!deliveredAt || !policy) return { valid: false, message: "" };

    const deliveryDate = new Date(deliveredAt);
    const currentDate = new Date();

    const allowedDays = Math.max(
      policy.isReturnable ? (policy.returnDays || 0) : 0,
      policy.isExchangeable ? (policy.exchangeDays || 0) : 0
    );

    const expiryDate = new Date(deliveryDate);
    expiryDate.setDate(expiryDate.getDate() + allowedDays);

    if (currentDate > expiryDate) {
      return { valid: false, message: "Return/Exchange window expired" };
    }

    return { valid: true, message: "" };
  };

  if (error) return <p className="page-container error-text">{error}</p>;
  if (!order) return <p className="page-container">Loading...</p>;

  const currentStepIndex = steps.indexOf(order.orderStatus);

  const isCancellable =
    order.paymentMethod === "COD" &&
    ["Placed", "Processing"].includes(order.orderStatus);

  return (
    <div className="page-container">
      <div className="track-order-header">
        <h2>Track Order #{order._id.slice(-8).toUpperCase()}</h2>
      </div>

      {requestSuccess && <p className="success-text">{requestSuccess}</p>}

      {order.orderStatus === "Cancelled" ? (
        <p className="error-text">This order has been cancelled.</p>
      ) : (
        <div className="tracker">
          {steps.map((step, i) => (
            <div key={step} className={`tracker-step ${i <= currentStepIndex ? "done" : ""}`}>
              <div className="tracker-dot" />
              <p>{step}</p>
            </div>
          ))}
        </div>
      )}

      {isCancellable && (
        <div style={{ marginTop: "15px" }}>
          <button
            type="button"
            className="cancel-order-btn"
            onClick={handleCancelOrder}
            disabled={cancelling}
            style={{
              padding: "10px 20px",
              background: "#fff",
              color: "#d63384",
              border: "1px solid #d63384",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        </div>
      )}

      <div className="estimated-delivery-card">
        {order.shipmentDetails && (
          <div className="shipment-card">
            <h3>Shipment Details</h3>
            <div className="shipment-row">
              <span>Courier Partner</span>
              <strong>{order.shipmentDetails.courierPartner}</strong>
            </div>
            <div className="shipment-row">
              <span>AWB Number</span>
              <strong>{order.shipmentDetails.awbNumber}</strong>
            </div>
            <div className="shipment-row">
              <span>Tracking ID</span>
              <strong>{order.shipmentDetails.trackingId}</strong>
            </div>
            {order.shipmentDetails.trackingUrl && (
              <a
                href={order.shipmentDetails.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="track-btn"
              >
                Track Package
              </a>
            )}
          </div>
        )}
        <div className="delivery-icon">📦</div>

        <div>
          <h4>Estimated Delivery</h4>
          <p>
            {order.orderStatus === "Delivered" ? (
              <>
                <span className="delivered-status">✅ Delivered </span>
                {order.deliveredAt && (
                  <span className="delivered-date">
                    {new Date(order.deliveredAt).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
              </>
            ) : order.estimatedDelivery ? (
              new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            ) : (
              "Not Assigned"
            )}
          </p>
        </div>
      </div>

      <div className="order-details">
        <h3>Shipping Address</h3>
        <p>{order.shippingAddress.fullName}</p>
        {order.shippingAddress.house ? (
          <>
            <p>{order.shippingAddress.house}</p>
            <p>{order.shippingAddress.area}</p>
            {order.shippingAddress.landmark && (
              <p>Landmark: {order.shippingAddress.landmark}</p>
            )}
          </>
        ) : (
          <p>{order.shippingAddress.street}</p>
        )}
        <p>
          {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
          {order.shippingAddress.pincode}
        </p>
        <p>
          <strong>Phone:</strong> {order.shippingAddress.phone}
        </p>

        <h3>Items</h3>
        {order.orderItems.map((item, i) => {
          const productId = item.product?._id || item.product;
          const request = getRequestForItem(productId);

          const policy = item.product?.returnPolicy;
          const isEligible = policy?.isReturnable || policy?.isExchangeable;

          const windowCheck = checkReturnWindowValidity(order.deliveredAt, policy);

          return (
            <div className="order-item-row" key={i}>
              <img src={item.image} alt={item.name} />
              <div className="order-item-row-info">
                <p>{item.name} {item.size && `(${item.size})`}</p>
                <p>Qty: {item.quantity} × ₹{item.price}</p>

                {order.orderStatus === "Delivered" && (
                  <div className="return-action-row">
                    {request && ["Requested", "Approved", "Completed"].includes(request.status) ? (
                      <span className={statusBadgeClass[request.status]}>
                        {request.type} {request.status}
                      </span>
                    ) : isEligible && windowCheck.valid ? (
                      <button
                        type="button"
                        className="request-return-btn"
                        onClick={() => openRequestModal(item)}
                      >
                        Request Return / Exchange
                      </button>
                    ) : (
                      <span className="text-muted" style={{ fontSize: "13px", color: "#888" }}>
                        {!isEligible ? "Return/Exchange not available" : windowCheck.message}
                      </span>
                    )}
                    {request?.status === "Rejected" && (
                      <span className="return-badge rejected">Previous request rejected</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
          <h3>Total: ₹{order.totalPrice}</h3>

          <button
            className="invoice-download-btn"
            onClick={handleDownloadInvoice}
            disabled={downloading}
            style={{ padding: "10px 20px", cursor: "pointer", fontWeight: "bold" }}
          >
            {downloading ? "Downloading..." : "📄 Download Invoice"}
          </button>
        </div>
      </div>

      {/* Return/Exchange Modal */}
      {modalItem && (
        <div className="return-modal-backdrop" onClick={closeModal}>
          <div className="return-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Request Return / Exchange</h3>
            <p className="return-modal-item">{modalItem.name}</p>

            {requestError && <p className="error-text">{requestError}</p>}

            <form onSubmit={submitRequest}>
              <div className="return-type-options">
                {modalItem.product?.returnPolicy?.isReturnable && (
                  <label className={requestType === "Return" ? "return-type-pill active" : "return-type-pill"}>
                    <input
                      type="radio"
                      name="requestType"
                      checked={requestType === "Return"}
                      onChange={() => setRequestType("Return")}
                    />
                    Return
                  </label>
                )}

                {modalItem.product?.returnPolicy?.isExchangeable && (
                  <label className={requestType === "Exchange" ? "return-type-pill active" : "return-type-pill"}>
                    <input
                      type="radio"
                      name="requestType"
                      checked={requestType === "Exchange"}
                      onChange={() => setRequestType("Exchange")}
                    />
                    Exchange
                  </label>
                )}
              </div>

              <textarea
                placeholder="Reason (optional)"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <div className="return-modal-actions">
                <button type="button" onClick={closeModal}>Cancel</button>
                <button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;