import { useEffect, useState } from "react";
import api from "../api/axios.js";

const AdminSettings = () => {
  const [form, setForm] = useState({ shippingCharge: "", freeShippingThreshold: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/settings").then((res) => {
      setForm({
        shippingCharge: res.data.shippingCharge,
        freeShippingThreshold: res.data.freeShippingThreshold,
      });
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setSaving(true);
    try {
      const { data } = await api.put("/settings", {
        shippingCharge: Number(form.shippingCharge),
        freeShippingThreshold: Number(form.freeShippingThreshold),
      });
      setForm({
        shippingCharge: data.shippingCharge,
        freeShippingThreshold: data.freeShippingThreshold,
      });
      setMsg("Settings updated successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading settings...</p>;

  return (
    <div>
      <h2>Shipping Settings</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        {msg && <p className="success-text">{msg}</p>}
        {error && <p className="error-text">{error}</p>}

        <div className="form-grid">
          <div>
            <label>Shipping Charge (₹)</label>
            <input
              type="number"
              min="0"
              required
              value={form.shippingCharge}
              onChange={(e) => setForm({ ...form, shippingCharge: e.target.value })}
            />
          </div>

          <div>
            <label>Free Shipping Above (₹)</label>
            <input
              type="number"
              min="0"
              required
              value={form.freeShippingThreshold}
              onChange={(e) => setForm({ ...form, freeShippingThreshold: e.target.value })}
            />
          </div>
        </div>

        <p className="settings-hint">
          Orders above ₹{form.freeShippingThreshold || 0} get free shipping. Below that, ₹
          {form.shippingCharge || 0} is charged.
        </p>

        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;