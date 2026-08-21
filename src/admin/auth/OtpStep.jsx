import { useState, useRef, useEffect } from "react";
import api from "../../api/axios";

const OtpStep = ({ email, setStep, setIsNewUser }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const inputs = useRef([]);

  // ✅ Auto focus first input on mount
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  // ✅ Timer countdown
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // ✅ Handle single digit input
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // ✅ Clear error on input
    if (error) setError("");

    // ✅ Move to next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    // ✅ Auto-submit when all 6 digits are filled
    if (value && index === 5) {
      const code = newOtp.join("");
      if (code.length === 6) {
        verifyOtp(code);
      }
    }
  };

  // ✅ Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    // ✅ Handle Enter key to submit
    if (e.key === "Enter") {
      verifyOtp();
    }
  };

  // ✅ Handle paste
  const handlePaste = (e) => {
    e.preventDefault();

    const paste = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!paste) return;

    const arr = paste.split("");

    while (arr.length < 6) arr.push("");

    setOtp(arr);

    // ✅ Focus last filled input
    const lastIndex = Math.min(paste.length - 1, 5);
    inputs.current[lastIndex]?.focus();

    // ✅ Auto-submit if pasted a full 6-digit code
    if (paste.length === 6) {
      verifyOtp(paste);
    }
  };

  // ✅ Verify OTP
  const verifyOtp = async (codeOverride) => {
    const code = codeOverride || otp.join("");

    // ✅ Validate OTP length
    if (code.length !== 6) {
      return setError("Please enter the complete 6-digit OTP");
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");

      const { data } = await api.post("/auth/verify-otp", {
        email,
        otp: code,
      });

      // ✅ New user - go to name step
      if (data.newUser) {
        setIsNewUser(true);
        setStep("name");
        return;
      }

      // ✅ Existing user - save token and redirect
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/";
      }

    } catch (err) {
      console.error("❌ Verify OTP error:", err);

      // ✅ Fixed - no more undefined alert
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid OTP. Please try again.";

      setError(message);

      // ✅ Clear OTP inputs on wrong OTP
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();

    } finally {
      setLoading(false);
    }
  };

  // ✅ Resend OTP
  const resendOtp = async () => {
    try {
      setResendLoading(true);
      setError("");
      setSuccessMsg("");

      await api.post("/auth/send-otp", { email });

      // ✅ Reset timer and OTP
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();

      setSuccessMsg("OTP resent successfully!");

      // ✅ Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(""), 3000);

    } catch (err) {
      console.error("❌ Resend OTP error:", err);

      // ✅ Fixed - no more undefined alert
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to resend OTP. Please try again.";

      setError(message);

    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Title */}
      <h2 className="auth-title">Verify Email</h2>

      {/* ✅ Subtitle */}
      <p className="auth-subtitle">
        Enter the 6-digit code sent to
        <br />
        <strong>{email}</strong>
      </p>

      {/* ✅ OTP Inputs */}
      <div className="otp-container" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputs.current[index] = el)}
            className={`otp-input ${error ? "otp-input-error" : ""}`}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={loading}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      {/* ✅ Error Message */}
      {error && (
        <p className="auth-error">{error}</p>
      )}

      {/* ✅ Success Message */}
      {successMsg && (
        <p className="auth-success">{successMsg}</p>
      )}

      {/* ✅ Verify Button */}
      <button
        className="continue-btn"
        onClick={() => verifyOtp()}
        disabled={loading || otp.join("").length !== 6}
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      {/* ✅ Resend OTP Footer */}
      <div className="otp-footer">
        {timer > 0 ? (
          <p>Resend OTP in <strong>{timer}s</strong></p>
        ) : (
          <button
            className="resend-btn"
            onClick={resendOtp}
            disabled={resendLoading}
          >
            {resendLoading ? "Sending..." : "Resend OTP"}
          </button>
        )}
      </div>

      {/* ✅ Back Button */}
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <button
          className="back-btn"
          onClick={() => setStep("email")}
          disabled={loading}
        >
          ← Change Email
        </button>
      </div>
    </>
  );
};

export default OtpStep;