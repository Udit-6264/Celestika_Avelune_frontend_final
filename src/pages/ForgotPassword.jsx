import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      if (data.userId) {
        navigate("/reset-password", { state: { userId: data.userId, email } });
      } else {
        // No account found for this email — backend intentionally hides this,
        // but there's nothing to move on to.
        setError("If an account with that email exists, an OTP has been sent.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <p className="auth-subtext">Enter your email and we'll send you an OTP to reset your password.</p>
        {error && <p className="error-text">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </button>
        <p><Link to="/login">Back to Login</Link></p>
      </form>
    </div>
  );
};

export default ForgotPassword;