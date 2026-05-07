import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import { getAllUsers } from '../../services/adminService.js';
import { getAuditLogs } from '../../services/auditService.js';

const MODULE_OPTIONS = ['', 'Payroll', 'Procurement', 'User'];

const formatDate = (value) =>
  new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    action: '',
    module: '',
    userId: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const list = await getAllUsers();
        setUsers(list);
      } catch {
        setUsers([]);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await getAuditLogs(filters);
        setLogs(data);
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message || 'Unable to load audit logs.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [filters.action, filters.module, filters.userId]);

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Audit Logs</h2>
          <p className="page-subtitle">
            Review critical operational actions across payroll, procurement, and user
            management.
          </p>
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <Card className="filter-card">
        <div className="audit-filter-grid">
          <Input
            id="audit-action"
            name="audit-action"
            label="Action"
            placeholder="Search action..."
            value={filters.action}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, action: event.target.value }))
            }
          />

          <div className="form-field">
            <label htmlFor="audit-module" className="form-label">
              Module
            </label>
            <select
              id="audit-module"
              className="input"
              value={filters.module}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, module: event.target.value }))
              }
            >
              <option value="">All modules</option>
              {MODULE_OPTIONS.filter(Boolean).map((moduleName) => (
                <option key={moduleName} value={moduleName}>
                  {moduleName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="audit-user" className="form-label">
              User
            </label>
            <select
              id="audit-user"
              className="input"
              value={filters.userId}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, userId: event.target.value }))
              }
            >
              <option value="">All users</option>
              {users.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} ({item.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card className="departments-card">
        {isLoading ? (
          <p className="muted-copy">Loading audit logs...</p>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No audit records found</p>
            <p className="empty-subtitle">
              Matching logs will appear here when critical actions are recorded.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td data-label="User" className="cell-strong">
                      <div className="payroll-employee-cell">
                        <span>{log.userId?.name || 'System'}</span>
                        <small>{log.userId?.email || '-'}</small>
                      </div>
                    </td>
                    <td data-label="Action">{log.action}</td>
                    <td data-label="Module">
                      <span className="status-badge">{log.module}</span>
                    </td>
                    <td data-label="Timestamp">{formatDate(log.timestamp || log.createdAt)}</td>
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
