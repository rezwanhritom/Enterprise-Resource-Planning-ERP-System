import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  createLeaveRequest,
  getCompanyLeaveRequests,
  getMyLeaveRequests,
  reviewLeaveRequest,
} from '../../services/leaveService.js';

const LEAVE_TYPES = [
  { value: 'annual', label: 'Annual' },
  { value: 'sick', label: 'Sick' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'personal', label: 'Personal' },
];

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export default function LeavePage() {
  const { user } = useAuth();
  const canManage = useMemo(
    () => user?.roles?.includes('Admin') || user?.roles?.includes('HR Manager'),
    [user?.roles]
  );

  const [myLeaves, setMyLeaves] = useState([]);
  const [companyLeaves, setCompanyLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [formData, setFormData] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const mine = await getMyLeaveRequests();
      setMyLeaves(mine);
      if (canManage) {
        const company = await getCompanyLeaveRequests({ status: 'pending' });
        setCompanyLeaves(company);
      }
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          'Unable to load leave requests.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [canManage]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      setFormMessage('Start and end dates are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormMessage('');
      setError('');
      await createLeaveRequest({
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
      });
      setFormData((prev) => ({
        ...prev,
        startDate: '',
        endDate: '',
        reason: '',
      }));
      setFormMessage('Leave request submitted.');
      await loadData();
    } catch (requestError) {
      setFormMessage(
        requestError?.response?.data?.message ||
          'Unable to submit leave request.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      setBusyId(id);
      setError('');
      await reviewLeaveRequest(id, { status });
      await loadData();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          `Unable to ${status} leave request.`
      );
    } finally {
      setBusyId('');
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Leave Requests</h2>
          <p className="page-subtitle">
            Request time off and track approval status across your company.
          </p>
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <Card
        title="Request Leave"
        subtitle="Submit a new leave request for manager review."
      >
        <form className="performance-form" onSubmit={handleSubmit}>
          <div className="performance-form-grid">
            <div className="form-field">
              <label htmlFor="leaveType" className="form-label">
                Leave type
              </label>
              <select
                id="leaveType"
                className="input"
                value={formData.leaveType}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    leaveType: event.target.value,
                  }))
                }
              >
                {LEAVE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Start date"
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  startDate: event.target.value,
                }))
              }
              required
            />
            <Input
              label="End date"
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  endDate: event.target.value,
                }))
              }
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="reason" className="form-label">
              Reason
            </label>
            <textarea
              id="reason"
              className="input textarea"
              rows={3}
              value={formData.reason}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, reason: event.target.value }))
              }
              placeholder="Optional note for your manager"
            />
          </div>
          {formMessage ? (
            <p
              className={
                formMessage.includes('submitted')
                  ? 'form-success'
                  : 'form-error'
              }
            >
              {formMessage}
            </p>
          ) : null}
          <div className="form-actions">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="My Leave Requests">
        {isLoading ? (
          <p className="muted-copy">Loading leave history...</p>
        ) : myLeaves.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No leave requests yet</p>
            <p className="empty-subtitle">
              Submit a request above to start your leave history.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td data-label="Type" className="cell-strong">
                      {leave.leaveType}
                    </td>
                    <td data-label="Dates">
                      {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                    </td>
                    <td data-label="Status">{leave.status}</td>
                    <td data-label="Reason">{leave.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {canManage ? (
        <Card
          title="Pending Company Requests"
          subtitle="Approve or reject leave requests for your organization."
        >
          {isLoading ? (
            <p className="muted-copy">Loading pending requests...</p>
          ) : companyLeaves.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">No pending requests</p>
              <p className="empty-subtitle">
                New leave submissions will appear here for review.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companyLeaves.map((leave) => (
                    <tr key={leave._id}>
                      <td data-label="Employee" className="cell-strong">
                        {leave.userId?.name || 'Employee'}
                      </td>
                      <td data-label="Type">{leave.leaveType}</td>
                      <td data-label="Dates">
                        {formatDate(leave.startDate)} –{' '}
                        {formatDate(leave.endDate)}
                      </td>
                      <td data-label="Reason">{leave.reason || '—'}</td>
                      <td data-label="Actions">
                        <div className="actions-col">
                          <Button
                            className="btn-small"
                            disabled={busyId === leave._id}
                            onClick={() => handleReview(leave._id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="secondary"
                            className="btn-small btn-danger-ghost"
                            disabled={busyId === leave._id}
                            onClick={() => handleReview(leave._id, 'rejected')}
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
      ) : null}
    </DashboardLayout>
  );
}
