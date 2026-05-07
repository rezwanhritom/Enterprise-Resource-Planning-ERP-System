import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import { getDepartments } from '../../services/departmentService.js';
import { getAllEmployees } from '../../services/employeeService.js';

const ROLE_OPTIONS = [
  'Admin',
  'HR Manager',
  'Accountant',
  'Inventory Manager',
  'Employee',
  'Finance Manager',
  'Procurement Manager',
  'Supervisor',
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    role: '',
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 250);
    return () => clearTimeout(timeout);
  }, [filters.search]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch {
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setError('');
        setIsLoading(true);
        const data = await getAllEmployees({
          search: debouncedSearch,
          department: filters.department,
          role: filters.role,
        });
        setEmployees(data);
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message ||
          'Unable to load employee directory.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, [debouncedSearch, filters.department, filters.role]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const hasFilters = useMemo(
    () => Boolean(filters.search || filters.department || filters.role),
    [filters]
  );

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Employees</h2>
          <p className="page-subtitle">
            Search and filter employee records across departments and roles.
          </p>
        </div>
      </section>

      <Card className="filter-card">
        <div className="filter-grid">
          <Input
            id="search"
            name="search"
            label="Search by name"
            placeholder="Type employee name..."
            value={filters.search}
            onChange={handleFilterChange}
          />

          <div className="form-field">
            <label htmlFor="department" className="form-label">
              Department
            </label>
            <select
              id="department"
              name="department"
              className="input"
              value={filters.department}
              onChange={handleFilterChange}
            >
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="role" className="form-label">
              Role
            </label>
            <select
              id="role"
              name="role"
              className="input"
              value={filters.role}
              onChange={handleFilterChange}
            >
              <option value="">All roles</option>
              {ROLE_OPTIONS.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleOption}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card className="departments-card">
        {error ? <p className="form-error">{error}</p> : null}

        {isLoading ? (
          <p className="muted-copy">Loading employee directory...</p>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No employees found</p>
            <p className="empty-subtitle">
              {hasFilters
                ? 'Try adjusting your search or filter criteria.'
                : 'Employee records will appear here.'}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Designation</th>
                  <th>Departments</th>
                  <th>Roles</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee._id}>
                    <td data-label="Name" className="cell-strong">
                      {employee.name}
                    </td>
                    <td data-label="Email">{employee.email}</td>
                    <td data-label="Designation">{employee.designation || '-'}</td>
                    <td data-label="Departments">
                      {employee.departments?.length
                        ? employee.departments.map((dept) => dept.name).join(', ')
                        : '-'}
                    </td>
                    <td data-label="Roles">
                      {employee.roles?.length ? employee.roles.join(', ') : '-'}
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
