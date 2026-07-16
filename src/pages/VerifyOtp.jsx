import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const VerifyOtp = () => {
  const { verifyOtp, resendOtp } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!state?.userId) {
    return (
      <div className="page-container">
        <p>No pending verification found. Please sign up first.</p>
      </div>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(state.userId, otp);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setMsg("");
    setError("");
    try {
      await resendOtp(state.userId);
      setMsg("OTP resent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleVerify}>
        <h2>Verify Your Email</h2>
        <p className="otp-note">We've sent a 6-digit OTP to <b>{state.email}</b></p>
        {error && <p className="error-text">{error}</p>}
        {msg && <p className="success-text">{msg}</p>}
        <input
          type="text"
          placeholder="Enter OTP"
          maxLength={6}
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify OTP"}</button>
        <button type="button" className="link-btn" onClick={handleResend}>Resend OTP</button>
      </form>
    </div>
  );
};

export default VerifyOtp;
