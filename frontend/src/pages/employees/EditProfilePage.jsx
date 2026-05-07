import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { getProfile, updateProfile } from '../../services/employeeService.js';
import { useAuth } from '../../context/AuthContext.jsx';

const buildReadonlySummary = (profile) => ({
  email: profile?.email || '-',
  roles: profile?.roles?.length ? profile.roles.join(', ') : '-',
  departments: profile?.departments?.length
    ? profile.departments.map((item) => item.name).join(', ')
    : '-',
});

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, token, login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    designation: '',
  });
  const [readonlyInfo, setReadonlyInfo] = useState({
    email: '-',
    roles: '-',
    departments: '-',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await getProfile();
        setFormData({
          name: profile?.name || '',
          phone: profile?.phone || '',
          address: profile?.address || '',
          designation: profile?.designation || '',
        });
        setReadonlyInfo(buildReadonlySummary(profile));
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message ||
          'Unable to load profile details.';
        setFormMessage(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const phoneError = useMemo(() => {
    if (!formData.phone.trim()) return '';
    return /^[0-9+()\-\s]{7,20}$/.test(formData.phone.trim())
      ? ''
      : 'Phone number format looks invalid.';
  }, [formData.phone]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setFormMessage('');
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required.';
    }
    if (phoneError) {
      nextErrors.phone = phoneError;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setFormMessage('');
      const updated = await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        designation: formData.designation.trim(),
      });

      login({
        token,
        user: {
          ...user,
          ...updated,
        },
      });

      navigate('/profile', { replace: true });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        'Unable to update profile. Please try again.';
      setFormMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Edit Profile</h2>
          <p className="page-subtitle">
            Update your employee contact and designation details.
          </p>
        </div>
      </section>

      <div className="profile-grid">
        <Card title="Editable Information" subtitle="Changes are saved securely">
          {isLoading ? (
            <p className="muted-copy">Loading form...</p>
          ) : (
            <form className="department-form" onSubmit={handleSubmit}>
              <Input
                id="name"
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name ? <p className="form-error">{errors.name}</p> : null}

              <Input
                id="phone"
                name="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+880 1XXX-XXXXXX"
              />
              {errors.phone ? <p className="form-error">{errors.phone}</p> : null}

              <div className="form-field">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  className="input textarea"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter your current address"
                />
              </div>

              <Input
                id="designation"
                name="designation"
                label="Designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g. Senior HR Officer"
              />

              {formMessage ? <p className="form-error">{formMessage}</p> : null}

              <div className="form-actions">
                <Link to="/profile">
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </Card>

        <Card title="Read-Only Access Info" subtitle="Managed by administrators">
          <dl className="profile-list">
            <div>
              <dt>Email</dt>
              <dd>{readonlyInfo.email}</dd>
            </div>
            <div>
              <dt>Roles</dt>
              <dd>{readonlyInfo.roles}</dd>
            </div>
            <div>
              <dt>Departments</dt>
              <dd>{readonlyInfo.departments}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </DashboardLayout>
  );
}
