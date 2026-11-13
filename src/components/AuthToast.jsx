import { useAuth } from "../context/AuthContext";
import "./AuthToast.css";

export default function AuthToast() {
  const { notification, clearNotification } = useAuth();

  if (!notification || !notification.message) return null;

  return (
    <div
      className={`auth-toast-banner ${notification.type || "success"}`}
      role="alert"
      aria-live="polite"
    >
      <div className="auth-toast-icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <span className="auth-toast-msg">{notification.message}</span>

      <button
        type="button"
        className="auth-toast-close"
        onClick={clearNotification}
        aria-label="Dismiss notification"
      >
        <svg
          viewBox="0 0 24 24"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

