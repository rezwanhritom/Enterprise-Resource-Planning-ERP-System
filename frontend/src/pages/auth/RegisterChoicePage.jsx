import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RegisterChoicePage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-page auth-page-wide">
      <div className="register-choice">
        <div className="register-choice-header">
          <p className="register-eyebrow">Get started</p>
          <h1 className="register-title">How do you want to join ERP Suite?</h1>
          <p className="register-subtitle">
            Create a company workspace as an admin, or request access to an existing organization.
          </p>
        </div>

        <div className="register-choice-grid">
          <Link to="/register/company" className="register-choice-card">
            <h2>Register a company</h2>
            <p>
              Create your company ID, choose which modules to enable, and become the admin with full
              access.
            </p>
            <span className="register-choice-cta">Continue</span>
          </Link>

          <Link to="/register/join" className="register-choice-card">
            <h2>Join a company</h2>
            <p>
              Create your account, pick an existing company, and wait for their admin to approve you
              and assign a role.
            </p>
            <span className="register-choice-cta">Continue</span>
          </Link>
        </div>

        <p className="auth-back-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
