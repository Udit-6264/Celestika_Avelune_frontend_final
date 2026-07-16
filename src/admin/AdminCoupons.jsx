import { useEffect, useState } from "react";
import api from "../api/axios.js";

const emptyForm = {
  code: "",
  description: "",
  type: "flat",
  value: "",
  maxDiscount: "",
  minOrderValue: "",
  firstOrderOnly: false,
  expiryDate: "",
  usageLimit: "",
  isActive: true,
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");

  const loadCoupons = () => api.get("/coupons").then((res) => setCoupons(res.data));

  useEffect(() => {
    loadCoupons();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const payload = {
      ...form,
      value: Number(form.value),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      minOrderValue: Number(form.minOrderValue) || 0,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      expiryDate: form.expiryDate || undefined,
    };

    try {
      if (editingId) {
        await api.put(`/coupons/${editingId}`, payload);
        setMsg("Coupon updated!");
      } else {
        await api.post("/coupons", payload);
        setMsg("Coupon created!");
      }
      resetForm();
      loadCoupons();
    } catch (err) {
      setMsg(err.response?.data?.message || "Error saving coupon");
    }
  };

  const handleEdit = (c) => {
    setEditingId(c._id);
    setForm({
      code: c.code,
      description: c.description || "",
      type: c.type,
      value: c.value,
      maxDiscount: c.maxDiscount || "",
      minOrderValue: c.minOrderValue || "",
      firstOrderOnly: c.firstOrderOnly,
      expiryDate: c.expiryDate ? c.expiryDate.slice(0, 10) : "",
      usageLimit: c.usageLimit || "",
      isActive: c.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    await api.delete(`/coupons/${id}`);
    loadCoupons();
  };

  const toggleActive = async (c) => {
    await api.put(`/coupons/${c._id}`, { isActive: !c.isActive });
    loadCoupons();
  };

  return (
    <div>
      <h2>Manage Coupons</h2>

      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit Coupon" : "Create New Coupon"}</h3>
        {msg && <p className="success-text">{msg}</p>}

        <div className="form-grid">
          <input
            placeholder="Coupon Code (e.g. WELCOME50)"
            required
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            disabled={!!editingId}
          />

          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="flat">Flat ₹ Off</option>
            <option value="percent">Percentage Off</option>
          </select>

          <input
            type="number"
            placeholder={form.type === "flat" ? "Discount Amount (₹)" : "Discount (%)"}
            required
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
          />

          {form.type === "percent" && (
            <input
              type="number"
              placeholder="Max Discount Cap (₹, optional)"
              value={form.maxDiscount}
              onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
            />
          )}

          <input
            type="number"
            placeholder="Minimum Order Value (₹)"
            value={form.minOrderValue}
            onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
          />

          <input
            type="number"
            placeholder="Usage Limit (optional, total redemptions)"
            value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
          />

          <input
            type="date"
            placeholder="Expiry Date (optional)"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          />

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.firstOrderOnly}
              onChange={(e) => setForm({ ...form, firstOrderOnly: e.target.checked })}
            />
            First Order Only
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
        </div>

        <textarea
          placeholder="Description (optional, shown to customers)"
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="form-actions">
          <button type="submit">{editingId ? "Update Coupon" : "Create Coupon"}</button>
          {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <h3>All Coupons ({coupons.length})</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Type</th>
            <th>Min Order</th>
            <th>First Order?</th>
            <th>Usage</th>
            <th>Expiry</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c._id}>
              <td><b>{c.code}</b></td>
              <td>{c.type === "flat" ? `₹${c.value} off` : `${c.value}% off${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ""}`}</td>
              <td>₹{c.minOrderValue || 0}</td>
              <td>{c.firstOrderOnly ? "Yes" : "No"}</td>
              <td>{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
              <td>{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "—"}</td>
              <td>
                <button
                  className={c.isActive ? "status-toggle active" : "status-toggle"}
                  onClick={() => toggleActive(c)}
                >
                  {c.isActive ? "Active" : "Inactive"}
                </button>
              </td>
              <td>
                <button onClick={() => handleEdit(c)}>Edit</button>
                <button onClick={() => handleDelete(c._id)} className="danger-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCoupons;