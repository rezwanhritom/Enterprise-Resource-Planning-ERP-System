import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { FEATURE_CATALOG } from '../../constants/features.js';
import api from '../../services/api.js';

const INITIAL_FORM = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  companyName: '',
  industry: '',
  description: '',
  website: '',
};

export default function RegisterCompanyPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [features, setFeatures] = useState(FEATURE_CATALOG);
  const [selectedFeatures, setSelectedFeatures] = useState(
    FEATURE_CATALOG.map((item) => item.key)
  );
  const [error, setError] = useState('');
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadFeatures = async () => {
      try {
        setIsLoadingFeatures(true);
        const response = await api.get('/auth/features');
        const catalog = response?.data?.data || [];
        if (cancelled || !Array.isArray(catalog) || catalog.length === 0) return;
        setFeatures(catalog);
        setSelectedFeatures(catalog.map((item) => item.key));
      } catch {
        // Keep the local catalog so company setup still works if the API is down.
        if (!cancelled) {
          setFeatures(FEATURE_CATALOG);
          setSelectedFeatures(FEATURE_CATALOG.map((item) => item.key));
        }
      } finally {
        if (!cancelled) setIsLoadingFeatures(false);
      }
    };

    loadFeatures();
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
  };

  const toggleFeature = (key, required = false) => {
    if (required) return;
    setSelectedFeatures((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const validateStepOne = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Name, email, and password are required.');
      return false;
    }
    if (emailError) {
      setError(emailError);
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const validateStepTwo = () => {
    if (!formData.companyName.trim()) {
      setError('Company name is required.');
      return false;
    }
    if (selectedFeatures.length === 0) {
      setError('Select at least one feature for your dashboard.');
      return false;
    }
    return true;
  };

  const handleNext = (event) => {
    event.preventDefault();
    if (!validateStepOne()) return;
    setError('');
    setStep(2);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateStepTwo()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const response = await api.post('/auth/register-company', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        companyName: formData.companyName.trim(),
        industry: formData.industry.trim(),
        description: formData.description.trim(),
        website: formData.website.trim(),
        enabledFeatures: selectedFeatures,
      });

      const authData = response?.data?.data;
      if (!authData?.token || !authData?.user) {
        throw new Error('Unexpected registration response');
      }

      login({ token: authData.token, user: authData.user });
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        'Unable to register company. Please try again.';
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
        title="Register your company"
        subtitle={
          step === 1
            ? 'Step 1 of 2 — Create your admin account'
            : 'Step 2 of 2 — Company details and modules'
        }
      >
        {step === 1 ? (
          <form className="auth-form" onSubmit={handleNext}>
            <Input
              id="name"
              name="name"
              label="Full name"
              placeholder="Ada Lovelace"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              id="email"
              name="email"
              label="Work email (admin login)"
              type="email"
              placeholder="admin@company.com"
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
            {error ? <p className="form-error">{error}</p> : null}
            <Button type="submit" fullWidth>
              Continue to company setup
            </Button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              id="companyName"
              name="companyName"
              label="Company name"
              placeholder="Acme Manufacturing"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
            <Input
              id="industry"
              name="industry"
              label="Industry (optional)"
              placeholder="Manufacturing, Retail, Services..."
              value={formData.industry}
              onChange={handleChange}
            />
            <Input
              id="website"
              name="website"
              label="Website (optional)"
              placeholder="https://example.com"
              value={formData.website}
              onChange={handleChange}
            />
            <div className="form-field">
              <label htmlFor="description" className="form-label">
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                className="input textarea"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="What does your company do?"
              />
            </div>

            <div className="feature-picker">
              <p className="form-label">Modules for your dashboard</p>
              <p className="feature-picker-hint">
                Choose which features your company workspace should include. You will be the admin
                with full access.
              </p>
              {isLoadingFeatures ? (
                <p className="muted-copy">Loading modules...</p>
              ) : (
                <ul className="feature-picker-list">
                  {features.map((feature) => {
                    const checked = selectedFeatures.includes(feature.key);
                    return (
                      <li key={feature.key}>
                        <label
                          className={`feature-picker-item ${checked ? 'is-selected' : ''}`.trim()}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={Boolean(feature.required)}
                            onChange={() => toggleFeature(feature.key, feature.required)}
                          />
                          <span>
                            <strong>{feature.label}</strong>
                            <small>{feature.description}</small>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {error ? <p className="form-error">{error}</p> : null}
            <div className="form-actions auth-form-actions">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoadingFeatures}>
                {isSubmitting ? 'Creating company...' : 'Create company workspace'}
              </Button>
            </div>
          </form>
        )}

        <p className="auth-back-link">
          Prefer to join an existing company? <Link to="/register/join">Join a company</Link>
        </p>
        <p className="auth-back-link">
          <Link to="/login">Back to sign in</Link>
        </p>
      </Card>
    </div>
  );
}
