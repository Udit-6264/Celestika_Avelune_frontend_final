import { useState } from "react";
import api from "../api/axios.js";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [status, setStatus] = useState("idle");
  // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await api.post("/contact", form);
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="page-container static-page">
      <h2>Contact Us</h2>
      <p>Have a question about your order or our products? Reach out to us.</p>

      <div className="contact-grid">
        <form className="contact-form" onSubmit={handleSubmit}>

          {/* ✅ Success */}
          {status === "success" && (
            <div className="contact-alert success">
              ✅ Message sent! We'll get back to you within 24 hours.
            </div>
          )}

          {/* ✅ Error */}
          {status === "error" && (
            <div className="contact-alert error">
              ❌ Something went wrong. Please try again.
            </div>
          )}

          <input
            placeholder="Your Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Your Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <textarea
            placeholder="Your Message"
            rows={5}
            required
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />

          <button
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Sending... ⏳" : "Send Message →"}
          </button>

        </form>

        <div className="contact-info">
          <h3>Get in touch</h3>
          <p>📧 support@bloomandbelle.com</p>
          <p>📞 +91 98765 43210</p>
          <p>📍 Jabalpur, Madhya Pradesh, India</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;