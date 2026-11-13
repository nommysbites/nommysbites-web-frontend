import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../pages/Account/Account.css";

/**
 * Route guard for /account/* pages.
 * If the user is unauthenticated, renders a clean message asking them to log in,
 * along with a Log In button.
 */
export default function AccountGuard({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="account-page-guard">
        <div className="account-guard-card">
          <div className="account-guard-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="36"
              height="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="account-guard-title">Please Log In</h1>
          <p className="account-guard-subtitle">
            You need to be logged in to view your account details and order
            history.
          </p>
          <div className="account-guard-actions">
            <Link to="/login" className="btn-account-primary">
              Log In
            </Link>
            <p className="account-guard-footer">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="account-guard-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

