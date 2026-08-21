import { useState } from "react";
import api from "../../api/axios";

const EmailStep = ({ email, setEmail, setStep }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      return setError("Please enter your email.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return setError("Please enter a valid email.");
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/send-otp", {
        email,
      });

      setStep("otp");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="auth-title">Welcome 👋</h1>

      <p className="auth-subtitle">
        Continue with your email to shop.
      </p>

      <form onSubmit={handleContinue}>

        <div className="input-group">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value.toLowerCase())
            }
            required
          />
        </div>

        {error && (
          <p className="auth-error">
            {error}
          </p>
        )}

        <button
          className="continue-btn"
          disabled={loading}
        >
          {loading ? "Sending OTP..." : "Continue"}
        </button>

      </form>

      <p className="auth-footer">
        By continuing you agree to our
        <br />
        Terms & Privacy Policy.
      </p>
    </>
  );
};

export default EmailStep;