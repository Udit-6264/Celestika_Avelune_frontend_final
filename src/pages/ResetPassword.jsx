import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios.js";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email } = location.state || {};

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!userId) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <h2>Reset Password</h2>
          <p className="error-text">
            Please start from the "Forgot Password" page.
          </p>
          <p><Link to="/forgot-password">Go to Forgot Password</Link></p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { userId, otp, newPassword });
      setSuccess("Password reset successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <p className="auth-subtext">
          Enter the OTP sent to <b>{email}</b> and your new password.
        </p>
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}
        <input
          type="text"
          placeholder="OTP"
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        <p><Link to="/login">Back to Login</Link></p>
      </form>
    </div>
  );
};

export default ResetPassword;