import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // ✅ Resend timer (60s cooldown)
  const [timer, setTimer] = useState(60);

  // ✅ Track if OTP was already auto-submitted, to avoid double-submit
  const autoSubmitted = useRef(false);

  // ✅ Start / reset countdown whenever we enter the otp step
  useEffect(() => {
    if (step !== "otp") return;

    setTimer(60);
    autoSubmitted.current = false;

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  const sendOtp = async () => {
    setLoading(true);

    try {
      await api.post("/auth/send-otp", {
        email,
      });

      setOtp("");
      setStep("otp");
    } catch (err) {
      alert(err.response?.data?.message);
    }

    setLoading(false);
  };

  const verifyOtp = async (codeOverride) => {
    const code = codeOverride ?? otp;

    if (code.length !== 6) return;

    setLoading(true);

    try {
      const { data } = await api.post("/auth/verify-otp", {
        email,
        otp: code,
      });

      if (data.newUser) {
        setStep("name");
      } else {
        login(data.user, data.token);
        navigate("/");
      }
    } catch (err) {
      alert(err.response?.data?.message);
      // ✅ Reset OTP so user can retry / auto-submit again
      setOtp("");
      autoSubmitted.current = false;
    }

    setLoading(false);
  };

  // ✅ Handle OTP input change + auto-submit at 6 digits
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);

    if (value.length === 6 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      verifyOtp(value);
    }
  };

  // ✅ Resend OTP
  const resendOtp = async () => {
    setResendLoading(true);

    try {
      await api.post("/auth/send-otp", { email });

      setOtp("");
      autoSubmitted.current = false;
      setTimer(60);
    } catch (err) {
      alert(err.response?.data?.message);
    }

    setResendLoading(false);
  };

  const completeProfile = async () => {
    setLoading(true);

    try {
      const { data } = await api.post("/auth/complete-profile", {
        email,
        name,
      });

      login(data.user, data.token);

      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <h2>Welcome 👋</h2>

        {step === "email" && (
          <>
            <p>Continue with your Email</p>

            <input
              className="auth-input"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              className="auth-btn"
              onClick={sendOtp}
              disabled={loading}
            >
              {loading ? "Sending..." : "Continue"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <p>Enter OTP sent to</p>

            <strong>{email}</strong>

            <input
              className="auth-input otp-input"
              placeholder="6 Digit OTP"
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
              inputMode="numeric"
              disabled={loading}
            />

            <button
              className="auth-btn"
              onClick={() => verifyOtp()}
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            {/* ✅ Resend OTP / Countdown */}
            <div style={{ marginTop: "12px", textAlign: "center" }}>
              {timer > 0 ? (
                <p style={{ fontSize: "14px", color: "#777" }}>
                  Resend OTP in <strong>{timer}s</strong>
                </p>
              ) : (
                <button
                  className="resend-btn"
                  onClick={resendOtp}
                  disabled={resendLoading}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#d63384",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {resendLoading ? "Sending..." : "Resend OTP"}
                </button>
              )}
            </div>

            {/* ✅ Change Email */}
            <div style={{ marginTop: "8px", textAlign: "center" }}>
              <button
                className="back-btn"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                }}
                disabled={loading}
                style={{
                  background: "none",
                  border: "none",
                  color: "#999",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                ← Change Email
              </button>
            </div>
          </>
        )}

        {step === "name" && (
          <>
            <p>Welcome 🌸</p>

            <input
              className="auth-input"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <button
              className="auth-btn"
              onClick={completeProfile}
              disabled={loading}
            >
              {loading ? "Please wait..." : "Continue Shopping"}
            </button>
          </>
        )}

      </div>

    </div>
  );
};

export default Auth;