import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { getProfile } from '../../services/employeeService.js';

const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  return new Date(dateValue).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const toLabel = (values = []) => (values.length ? values.join(', ') : '-');

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError('');
        setIsLoading(true);
        const data = await getProfile();
        setProfile(data);
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message ||
          'Unable to load profile at this time.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const departmentNames =
    profile?.departments?.map((department) => department.name) ?? [];

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Profile</h2>
          <p className="page-subtitle">
            Review your employee details and organizational information.
          </p>
        </div>
        <Link to="/profile/edit">
          <Button variant="secondary">Edit Profile</Button>
        </Link>
      </section>

      {error ? <p className="form-error">{error}</p> : null}
      {isLoading ? (
        <Card>
          <p className="muted-copy">Loading profile...</p>
        </Card>
      ) : (
        <div className="profile-grid">
          <Card title="Employee Details" subtitle="Personal information">
            <dl className="profile-list">
              <div>
                <dt>Full Name</dt>
                <dd>{profile?.name || '-'}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{profile?.email || '-'}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{profile?.phone || '-'}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{profile?.address || '-'}</dd>
              </div>
              <div>
                <dt>Designation</dt>
                <dd>{profile?.designation || '-'}</dd>
              </div>
              <div>
                <dt>Joining Date</dt>
                <dd>{formatDate(profile?.joiningDate)}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Access and Organization" subtitle="System role context">
            <dl className="profile-list">
              <div>
                <dt>Roles</dt>
                <dd>{toLabel(profile?.roles || [])}</dd>
              </div>
              <div>
                <dt>Departments</dt>
                <dd>{toLabel(departmentNames)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{profile?.isActive ? 'Active' : 'Inactive'}</dd>
              </div>
            </dl>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
