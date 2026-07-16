import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const statuses = ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  // ✅ Local state for date changes
  const [localDates, setLocalDates] = useState({});
  const [savingId, setSavingId] = useState(null);

  const loadOrders = () => {
    api.get("/orders/all").then((res) => {
      setOrders(res.data);

      // ✅ Existing dates ko local state mein set karo
      const dates = {};
      res.data.forEach((o) => {
        dates[o._id] = o.estimatedDelivery
          ? new Date(o.estimatedDelivery).toISOString().split("T")[0]
          : "";
      });
      setLocalDates(dates);
    });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // ✅ Status change - sirf status update karo
  const handleStatusChange = async (id, status) => {
    await api.put(`/orders/${id}/status`, {
      status,
      estimatedDelivery: localDates[id] || "",
    });
    loadOrders();
  };

  // ✅ Date change - sirf local state update karo (API call mat karo)
  const handleDateChange = (id, value) => {
    setLocalDates((prev) => ({ ...prev, [id]: value }));
  };

  // ✅ Save button click par API call karo
  const handleDateSave = async (id, orderStatus) => {
    setSavingId(id);
    try {
      await api.put(`/orders/${id}/status`, {
        status: orderStatus,
        estimatedDelivery: localDates[id],
      });
      alert("✅ Delivery date saved!");
    } catch (err) {
      alert("❌ Failed to save date");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <h2>All Orders ({orders.length})</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Estimated Delivery</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>

              {/* Order ID */}
              <td>#{o._id.slice(-8).toUpperCase()}</td>

              {/* Customer */}
              <td>
                {o.user?.name}
                <br />
                <small>{o.user?.email}</small>
              </td>

              {/* Items */}
              <td>{o.orderItems.length} item(s)</td>

              {/* Total */}
              <td>₹{o.totalPrice}</td>

              {/* Payment */}
              <td>
                <span className={o.isPaid ? "pay-status paid" : "pay-status unpaid"}>
                  {o.isPaid ? "Paid" : "Unpaid"}
                </span>
              </td>

              {/* Status Dropdown */}
              <td>
                <select
                  value={o.orderStatus}
                  onChange={(e) => handleStatusChange(o._id, e.target.value)}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>

              {/* ✅ Date Picker + Save Button */}
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="date"
                    value={localDates[o._id] || ""}
                    onChange={(e) => handleDateChange(o._id, e.target.value)}
                    style={{
                      padding: "5px 8px",
                      border: "1px solid #f48fb1",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      color: "#333",
                      cursor: "pointer",
                    }}
                  />

                  {/* ✅ Save Button */}
                  <button
                    onClick={() => handleDateSave(o._id, o.orderStatus)}
                    disabled={savingId === o._id}
                    style={{
                      padding: "5px 10px",
                      background: savingId === o._id ? "#ccc" : "#e91e8c",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      cursor: savingId === o._id ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {savingId === o._id ? "..." : "Save"}
                  </button>
                </div>
              </td>

              {/* View Details */}
              <td>
                <Link
                  to={`/admin/orders/${o._id}`}
                  className="view-details-link"
                >
                  View Details →
                </Link>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders;