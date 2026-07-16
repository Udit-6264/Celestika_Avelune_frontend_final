import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: { fullName: "", phone: "", street: "", city: "", state: "", pincode: "" },
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/auth/profile").then((res) => {
      setForm({
        name: res.data.name || "",
        phone: res.data.phone || "",
        address: res.data.address || { fullName: "", phone: "", street: "", city: "", state: "", pincode: "" },
      });
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    const { data } = await api.put("/auth/profile", form);
    setUser({ ...user, name: data.name });
    localStorage.setItem("user", JSON.stringify({ ...user, name: data.name }));
    setMsg("Profile updated successfully!");
  };

  return (
    <div className="page-container">
      <h2>My Profile</h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        {msg && <p className="success-text">{msg}</p>}
        <label>Email</label>
        <input type="email" value={user?.email || ""} disabled />

        <label>Full Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <label>Phone</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

        <h3>Shipping Address</h3>
        <label>Street</label>
        <input
          value={form.address.street}
          onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
        />
        <label>City</label>
        <input
          value={form.address.city}
          onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
        />
        <label>State</label>
        <input
          value={form.address.state}
          onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
        />
        <label>Pincode</label>
        <input
          value={form.address.pincode}
          onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })}
        />

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default Profile;
