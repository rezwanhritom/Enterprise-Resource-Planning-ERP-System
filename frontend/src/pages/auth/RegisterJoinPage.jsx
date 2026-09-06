import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';

const INITIAL_FORM = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  companyId: '',
};

export default function RegisterJoinPage() {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadCompanies = async () => {
      try {
        setIsLoadingCompanies(true);
        const response = await api.get('/auth/companies');
        if (!cancelled) {
          setCompanies(response?.data?.data || []);
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load companies. Please refresh and try again.');
        }
      } finally {
        if (!cancelled) setIsLoadingCompanies(false);
      }
    };

    loadCompanies();
    return () => {
      cancelled = true;
    };
  }, []);

  const emailError = useMemo(() => {
    if (!formData.email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(formData.email) ? '' : 'Enter a valid email address.';
  }, [formData.email]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.companyId
    ) {
      setError('Name, email, password, and company are required.');
      return;
    }

    if (emailError) {
      setError(emailError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');
      const response = await api.post('/auth/register-join', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        companyId: formData.companyId,
      });

      setSuccess(
        response?.data?.message ||
          'Request submitted. Wait for a company admin to approve your account.'
      );
      setFormData(INITIAL_FORM);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        'Unable to submit join request. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-page auth-page-wide">
      <Card
        className="auth-card auth-card-wide"
        title="Join an existing company"
        subtitle="Create your account, then wait for admin approval and role assignment."
      >
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            id="name"
            name="name"
            label="Full name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            id="email"
            name="email"
            label="Work email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {emailError ? <p className="form-error">{emailError}</p> : null}
          <Input
            id="password"
            name="password"
            label="Password"
            type="password"
            placeholder="Min 10 chars with upper, lower, number, symbol"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <div className="form-field">
            <label htmlFor="companyId" className="form-label">
              Company to join
            </label>
            <select
              id="companyId"
              name="companyId"
              className="input"
              value={formData.companyId}
              onChange={handleChange}
              required
              disabled={isLoadingCompanies}
            >
              <option value="">
                {isLoadingCompanies ? 'Loading companies...' : 'Select a company'}
              </option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.name}
                  {company.industry ? ` — ${company.industry}` : ''}
                </option>
              ))}
            </select>
          </div>

          {companies.length === 0 && !isLoadingCompanies ? (
            <p className="form-error">
              No companies are registered yet. Ask an admin to register a company first.
            </p>
          ) : null}

          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}

          <Button type="submit" fullWidth disabled={isSubmitting || isLoadingCompanies}>
            {isSubmitting ? 'Submitting...' : 'Request to join'}
          </Button>
        </form>

        <p className="auth-back-link">
          Need to create a company instead?{' '}
          <Link to="/register/company">Register a company</Link>
        </p>
        <p className="auth-back-link">
          <Link to="/login">Back to sign in</Link>
        </p>
      </Card>
    </div>
  );
}
