import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import api from '../../services/api.js';

const ROLE_OPTIONS = [
  'Employee',
  'HR Manager',
  'Accountant',
  'Inventory Manager',
  'Finance Manager',
  'Procurement Manager',
  'Supervisor',
  'Admin',
];

export default function JoinRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [roleDrafts, setRoleDrafts] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const loadRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await api.get('/admin/join-requests');
      const data = response?.data?.data || [];
      setRequests(data);
      setRoleDrafts(
        Object.fromEntries(data.map((item) => [item._id, ['Employee']]))
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || 'Unable to load join requests.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const toggleRole = (userId, role) => {
    setRoleDrafts((prev) => {
      const current = prev[userId] || [];
      const next = current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role];
      return {
        ...prev,
        [userId]: next.length > 0 ? next : ['Employee'],
      };
    });
  };

  const handleApprove = async (userId) => {
    try {
      setBusyId(userId);
      setError('');
      setSuccess('');
      await api.post(`/admin/join-requests/${userId}/approve`, {
        roles: roleDrafts[userId] || ['Employee'],
      });
      setSuccess('Join request approved.');
      await loadRequests();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || 'Unable to approve request.'
      );
    } finally {
      setBusyId('');
    }
  };

  const handleReject = async (userId) => {
    try {
      setBusyId(userId);
      setError('');
      setSuccess('');
      await api.post(`/admin/join-requests/${userId}/reject`);
      setSuccess('Join request rejected.');
      await loadRequests();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || 'Unable to reject request.'
      );
    } finally {
      setBusyId('');
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Join requests</h1>
          <p className="page-subtitle">
            Approve people who asked to join your company and assign their roles.
          </p>
        </div>
      </div>

      {error ? <p className="form-error dashboard-error">{error}</p> : null}
      {success ? <p className="form-success dashboard-error">{success}</p> : null}

      <Card className="departments-card">
        {isLoading ? (
          <p className="muted-copy">Loading requests...</p>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No pending requests</p>
            <p className="empty-subtitle">
              When someone registers to join your company, they will appear here.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Requested</th>
                  <th>Assign roles</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td data-label="Name" className="cell-strong">
                      {request.name}
                    </td>
                    <td data-label="Email">{request.email}</td>
                    <td data-label="Requested">
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleString()
                        : '—'}
                    </td>
                    <td data-label="Assign roles">
                      <div className="role-chip-grid">
                        {ROLE_OPTIONS.map((role) => {
                          const checked = (roleDrafts[request._id] || []).includes(
                            role
                          );
                          return (
                            <label key={role} className="role-chip">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleRole(request._id, role)}
                              />
                              {role}
                            </label>
                          );
                        })}
                      </div>
                    </td>
                    <td data-label="Actions">
                      <div className="actions-col">
                        <Button
                          className="btn-small"
                          disabled={busyId === request._id}
                          onClick={() => handleApprove(request._id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="secondary"
                          className="btn-small btn-danger-ghost"
                          disabled={busyId === request._id}
                          onClick={() => handleReject(request._id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
