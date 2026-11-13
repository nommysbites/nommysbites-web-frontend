import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../pages/Auth.css";

const OTP_LENGTH = 6;

/**
 * Passwordless authentication page shared by /login and /signup.
 * Renders directly on the page (no container card) with a horizontal
 * sliding track between the email input, 6-digit OTP, and verified states.
 */
export default function AuthPage({ mode = "login" }) {
  const isSignup = mode === "signup";
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); // "email" | "otp" | "verified"
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [viewportHeight, setViewportHeight] = useState(undefined);

  const emailInputRef = useRef(null);
  const otpInputRefs = useRef([]);
  const emailPaneRef = useRef(null);
  const otpPaneRef = useRef(null);

  // Reset form state cleanly if user switches between /login and /signup
  const [prevMode, setPrevMode] = useState(mode);
  if (prevMode !== mode) {
    setPrevMode(mode);
    setStep("email");
    setEmailError("");
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setResendCooldown(0);
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mode]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Dynamically size viewport to active slide's height for smooth height transitions
  useEffect(() => {
    const activeElement =
      step === "email" ? emailPaneRef.current : otpPaneRef.current;

    if (!activeElement) return undefined;

    const updateHeight = () => {
      setViewportHeight(activeElement.offsetHeight);
    };

    updateHeight();

    const ro = new ResizeObserver(updateHeight);
    ro.observe(activeElement);
    return () => ro.disconnect();
  }, [step, mode, emailError, otpError]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailError("");
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setResendCooldown(30);
    setStep("otp");

    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 350);
  };

  const handleBackToEmail = () => {
    setStep("email");
    setOtpError("");
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 350);
  };

  const handleOtpChange = (index, rawVal) => {
    const cleaned = rawVal.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      setOtpError("");
      return;
    }

    const next = [...otpDigits];
    if (cleaned.length > 1) {
      // Handle pasted/autofilled multi-digit input
      const chars = cleaned.slice(0, OTP_LENGTH).split("");
      chars.forEach((ch, offset) => {
        if (index + offset < OTP_LENGTH) {
          next[index + offset] = ch;
        }
      });
      setOtpDigits(next);
      setOtpError("");
      const focusIdx = Math.min(OTP_LENGTH - 1, index + chars.length);
      otpInputRefs.current[focusIdx]?.focus();
      return;
    }

    next[index] = cleaned;
    setOtpDigits(next);
    setOtpError("");
    if (index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData?.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, idx) => {
      next[idx] = ch;
    });
    setOtpDigits(next);
    setOtpError("");

    const targetIdx = Math.min(OTP_LENGTH - 1, pasted.length - 1);
    otpInputRefs.current[targetIdx]?.focus();
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setResendCooldown(30);
    otpInputRefs.current[0]?.focus();
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length < OTP_LENGTH) {
      setOtpError("Please enter the full 6-digit code.");
      return;
    }
    setOtpError("");
    const trimmedEmail = email.trim();
    const successMsg = isSignup
      ? `You have successfully registered as ${trimmedEmail}`
      : `You are logged in as ${trimmedEmail}`;
    login(trimmedEmail, successMsg);
    navigate("/", { replace: true });
  };

  const stepIndex = step === "email" ? 0 : 1;

  const pageTitle = isSignup ? "Create Your Account" : "Welcome Back";
  const pageSubtitle = isSignup
    ? "Sign up with Google or enter your email for a verification code."
    : "Log in with Google or enter your email for a verification code.";

  return (
    <div className="auth-page" role="main">
      <div className="auth-container">
        {/* Horizontal sliding viewport */}
        <div
          className="auth-slider-viewport"
          style={{ height: viewportHeight ? `${viewportHeight}px` : "auto" }}
        >
          <div
            className="auth-slider-track"
            style={{ transform: `translateX(-${stepIndex * 100}%)` }}
          >
            {/* Slide 0: Email & Google */}
            <div
              ref={emailPaneRef}
              className={`auth-slide ${step === "email" ? "active" : ""}`}
              aria-hidden={step !== "email"}
            >
              <div className="auth-header">
                <span className="auth-eyebrow">
                  {isSignup ? "SIGN UP" : "LOG IN"}
                </span>
                <h1 className="auth-title">{pageTitle}</h1>
                <p className="auth-subtitle">{pageSubtitle}</p>
              </div>

              {/* Continue with Google (non-functional, no message) */}
              <button
                type="button"
                className="auth-google-btn"
                onClick={(e) => e.preventDefault()}
                tabIndex={step === "email" ? 0 : -1}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="auth-divider">
                <span>or continue with email</span>
              </div>

              {/* Email Input Form */}
              <form onSubmit={handleEmailSubmit} className="auth-form" noValidate>
                <div className="auth-field">
                  <label htmlFor="auth-email" className="auth-label">
                    Email Address
                  </label>
                  <input
                    id="auth-email"
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    placeholder="you@example.com"
                    className={`auth-input ${emailError ? "error" : ""}`}
                    autoComplete="email"
                    tabIndex={step === "email" ? 0 : -1}
                  />
                  {emailError && (
                    <span className="auth-err-msg">{emailError}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="auth-primary-btn"
                  tabIndex={step === "email" ? 0 : -1}
                >
                  <span>Send Verification Code</span>
                </button>
              </form>

              <div className="auth-footer-switch">
                {isSignup ? (
                  <p>
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="auth-switch-link"
                      tabIndex={step === "email" ? 0 : -1}
                    >
                      Log in
                    </Link>
                  </p>
                ) : (
                  <p>
                    New to Nommy&apos;s Bites?{" "}
                    <Link
                      to="/signup"
                      className="auth-switch-link"
                      tabIndex={step === "email" ? 0 : -1}
                    >
                      Sign up
                    </Link>
                  </p>
                )}
              </div>
            </div>

            {/* Slide 1: 6-Digit OTP */}
            <div
              ref={otpPaneRef}
              className={`auth-slide ${step === "otp" ? "active" : ""}`}
              aria-hidden={step !== "otp"}
            >
              <div className="auth-header">
                <div className="auth-back-row">
                  <button
                    type="button"
                    className="auth-back-btn"
                    onClick={handleBackToEmail}
                    tabIndex={step === "otp" ? 0 : -1}
                    aria-label="Back to email input"
                    title="Back"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="22"
                      height="22"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M19 12H5" />
                      <path d="m12 19-7-7 7-7" />
                    </svg>
                  </button>
                </div>
                <h1 className="auth-title">Enter Verification Code</h1>
                <p className="auth-subtitle">
                  We sent a 6-digit code to{" "}
                  <strong className="auth-email-highlight">
                    {email.trim()}
                  </strong>
                  .
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="auth-form" noValidate>
                <div className="auth-field">
                  <label htmlFor="otp-0" className="auth-label">
                    One-Time Passcode (OTP)
                  </label>
                  <div className="otp-inputs-row" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={OTP_LENGTH}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`otp-box ${otpError ? "error" : ""}`}
                        aria-label={`Digit ${idx + 1} of ${OTP_LENGTH}`}
                        autoComplete={idx === 0 ? "one-time-code" : "off"}
                        tabIndex={step === "otp" ? 0 : -1}
                      />
                    ))}
                  </div>
                  {otpError && (
                    <span className="auth-err-msg">{otpError}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="auth-primary-btn"
                  tabIndex={step === "otp" ? 0 : -1}
                >
                  <span>
                    {isSignup ? "Verify & Sign Up" : "Verify & Log In"}
                  </span>
                </button>

                <div className="auth-resend-row">
                  <span>Didn&apos;t get the code?</span>
                  <button
                    type="button"
                    className="auth-text-btn"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                    tabIndex={step === "otp" ? 0 : -1}
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend code"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
