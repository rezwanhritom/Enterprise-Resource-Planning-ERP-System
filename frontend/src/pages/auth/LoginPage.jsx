import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    if (!emailRegex.test(email)) {
      setError('Please provide a valid work email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const response = await api.post('/auth/login', { email, password });
      const authData = response?.data?.data;
      if (!authData?.token || !authData?.user) {
        throw new Error('Unexpected login response');
      }

      login({ token: authData.token, user: authData.user });
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        (requestError?.response?.status === 401
          ? 'Invalid email or password.'
          : 'Unable to sign in. Please try again.');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-page">
      <Card
        className="auth-card"
        title="Sign in to ERP Suite"
        subtitle="Access your organization workspace"
      >
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            id="email"
            name="email"
            label="Work Email"
            type="email"
            placeholder="name@company.com"
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
            placeholder="Enter your password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error ? <p className="form-error">{error}</p> : null}
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
