import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    login({
      user: { name: 'ERP User', email: formData.email || 'user@erp.local' },
      token: 'placeholder-token',
    });
    navigate('/dashboard');
  };

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
          <Button type="submit" fullWidth>
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  );
}
