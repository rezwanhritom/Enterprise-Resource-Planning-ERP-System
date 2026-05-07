import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import {
  deleteDepartment,
  getDepartments,
} from '../../services/departmentService.js';

const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  return new Date(dateValue).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyDeleteId, setBusyDeleteId] = useState('');

  const fetchDepartmentList = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getDepartments();
      setDepartments(data);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        'Unable to load departments at the moment.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentList();
  }, []);

  const handleDelete = async (departmentId) => {
    try {
      setBusyDeleteId(departmentId);
      setError('');
      await deleteDepartment(departmentId);
      setDepartments((prev) => prev.filter((item) => item._id !== departmentId));
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || 'Failed to delete department.';
      setError(message);
    } finally {
      setBusyDeleteId('');
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Departments</h2>
          <p className="page-subtitle">
            Manage organizational departments and their descriptions.
          </p>
        </div>
        <Link to="/departments/create">
          <Button>Create Department</Button>
        </Link>
      </section>

      <Card className="departments-card">
        {error ? <p className="form-error">{error}</p> : null}

        {isLoading ? (
          <p className="muted-copy">Loading departments...</p>
        ) : departments.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No departments yet</p>
            <p className="empty-subtitle">
              Create your first department to start structuring teams.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((department) => (
                  <tr key={department._id}>
                    <td data-label="Name" className="cell-strong">
                      {department.name}
                    </td>
                    <td data-label="Description">
                      {department.description || '-'}
                    </td>
                    <td data-label="Created">
                      {formatDate(department.createdAt)}
                    </td>
                    <td data-label="Actions" className="actions-col">
                      <Button
                        variant="secondary"
                        className="btn-small"
                        disabled
                        title="Edit will be added next iteration"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        className="btn-small btn-danger-ghost"
                        onClick={() => handleDelete(department._id)}
                        disabled={busyDeleteId === department._id}
                      >
                        {busyDeleteId === department._id ? 'Deleting...' : 'Delete'}
                      </Button>
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
