import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  approveRequest,
  getRequests,
  rejectRequest,
} from '../../services/procurementService.js';

const formatDate = (dateValue) =>
  new Date(dateValue).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const REVIEWER_ROLES = ['Admin', 'Procurement Manager', 'Supervisor', 'HR Manager'];

const STATUS_OPTIONS = [
  { value: '', label: 'All status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ProcurementPage() {
  const { user } = useAuth();
  const canReviewRequests = useMemo(
    () => user?.roles?.some((role) => REVIEWER_ROLES.includes(role)),
    [user?.roles]
  );

  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [rejectingId, setRejectingId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const loadRequests = async (status = statusFilter) => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getRequests({ status: status || undefined });
      setRequests(data);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || 'Unable to load procurement requests.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(statusFilter);
  }, [statusFilter]);

  const handleApprove = async (requestId) => {
    try {
      setBusyId(requestId);
      setError('');
      await approveRequest(requestId);
      await loadRequests();
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || 'Unable to approve request.';
      setError(message);
    } finally {
      setBusyId('');
    }
  };

  const handleReject = async (requestId) => {
    try {
      setBusyId(requestId);
      setError('');
      await rejectRequest(requestId, { rejectionReason });
      setRejectingId('');
      setRejectionReason('');
      await loadRequests();
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || 'Unable to reject request.';
      setError(message);
    } finally {
      setBusyId('');
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Procurement Workflow</h2>
          <p className="page-subtitle">
            Manage requisitions, monitor approval status, and track operational demand.
          </p>
        </div>
        <Link to="/procurement/create">
          <Button>Create Request</Button>
        </Link>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <Card className="filter-card">
        <div className="procurement-filter-grid">
          <div className="form-field">
            <label htmlFor="status" className="form-label">
              Filter by status
            </label>
            <select
              id="status"
              className="input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card className="departments-card">
        {isLoading ? (
          <p className="muted-copy">Loading procurement requests...</p>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No procurement requests found</p>
            <p className="empty-subtitle">
              Requests will appear here once your team submits requisitions.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Requester</th>
                  <th>Department</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Created</th>
                  {canReviewRequests ? <th className="actions-col">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td data-label="Requester" className="cell-strong">
                      <div className="payroll-employee-cell">
                        <span>{request.requestedBy?.name || '-'}</span>
                        <small>{request.requestedBy?.email || ''}</small>
                      </div>
                    </td>
                    <td data-label="Department">{request.department?.name || '-'}</td>
                    <td data-label="Items">
                      <ul className="procurement-items-list">
                        {(request.items || []).map((item, index) => (
                          <li key={`${request._id}-${index}`}>
                            {item.itemName} ({item.quantity})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td data-label="Status">
                      <span className={`status-badge status-${request.status}`}>
                        {request.status}
                      </span>
                    </td>
                    <td data-label="Created">{formatDate(request.createdAt)}</td>
                    {canReviewRequests ? (
                      <td data-label="Actions" className="actions-col">
                        {request.status === 'pending' ? (
                          <>
                            <Button
                              className="btn-small"
                              onClick={() => handleApprove(request._id)}
                              disabled={busyId === request._id}
                            >
                              {busyId === request._id ? 'Processing...' : 'Approve'}
                            </Button>
                            {rejectingId === request._id ? (
                              <div className="procurement-reject-box">
                                <input
                                  className="input input-compact procurement-reason-input"
                                  placeholder="Optional reason"
                                  value={rejectionReason}
                                  onChange={(event) =>
                                    setRejectionReason(event.target.value)
                                  }
                                />
                                <Button
                                  variant="secondary"
                                  className="btn-small btn-danger-ghost"
                                  onClick={() => handleReject(request._id)}
                                  disabled={busyId === request._id}
                                >
                                  Confirm Reject
                                </Button>
                                <Button
                                  variant="secondary"
                                  className="btn-small"
                                  onClick={() => {
                                    setRejectingId('');
                                    setRejectionReason('');
                                  }}
                                  disabled={busyId === request._id}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="secondary"
                                className="btn-small btn-danger-ghost"
                                onClick={() => setRejectingId(request._id)}
                                disabled={busyId === request._id}
                              >
                                Reject
                              </Button>
                            )}
                          </>
                        ) : (
                          <span className="muted-copy">
                            {request.approvedBy?.name
                              ? `Reviewed by ${request.approvedBy.name}`
                              : 'No action available'}
                          </span>
                        )}
                      </td>
                    ) : null}
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
