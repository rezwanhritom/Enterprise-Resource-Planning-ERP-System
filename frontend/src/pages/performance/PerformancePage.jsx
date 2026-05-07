import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getEmployeeDirectory } from '../../services/employeeService.js';
import { addNote, getEmployeeNotes } from '../../services/performanceService.js';

const MANAGER_ROLES = [
  'Admin',
  'HR Manager',
  'Supervisor',
  'Procurement Manager',
  'Finance Manager',
  'Inventory Manager',
];

const RATING_OPTIONS = [1, 2, 3, 4, 5];

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export default function PerformancePage() {
  const { user } = useAuth();
  const canManagePerformance = useMemo(
    () => user?.roles?.some((role) => MANAGER_ROLES.includes(role)),
    [user?.roles]
  );

  const [notes, setNotes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '',
    note: '',
    rating: '3',
  });
  const [formErrors, setFormErrors] = useState({});
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!canManagePerformance) return;

    const loadEmployees = async () => {
      try {
        const data = await getEmployeeDirectory();
        setEmployees(data);
      } catch {
        setEmployees([]);
      }
    };

    loadEmployees();
  }, [canManagePerformance]);

  const loadNotes = async ({ employeeId = selectedEmployee, rating = selectedRating } = {}) => {
    try {
      setIsLoading(true);
      setError('');
      const params = {};
      if (canManagePerformance && employeeId) params.employeeId = employeeId;
      if (rating) params.rating = rating;
      const data = await getEmployeeNotes(params);
      setNotes(data);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        'Unable to load performance notes right now.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotes({ employeeId: selectedEmployee, rating: selectedRating });
  }, [selectedEmployee, selectedRating, canManagePerformance]);

  const validateForm = () => {
    if (!canManagePerformance) return true;

    const nextErrors = {};
    if (!formData.employeeId) nextErrors.employeeId = 'Please select an employee.';
    if (!formData.note.trim()) nextErrors.note = 'Performance note is required.';

    const numericRating = Number(formData.rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      nextErrors.rating = 'Rating must be between 1 and 5.';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setFormMessage('');
      setError('');
      await addNote({
        employeeId: formData.employeeId,
        note: formData.note.trim(),
        rating: Number(formData.rating),
      });
      setFormData((prev) => ({ ...prev, note: '', rating: '3' }));
      setFormErrors({});
      setFormMessage('Performance note recorded successfully.');
      await loadNotes();
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        'Unable to add performance note. Please try again.';
      setFormMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Performance Notes</h2>
          <p className="page-subtitle">
            Track managerial feedback and maintain a consistent employee performance
            history.
          </p>
        </div>
      </section>

      {canManagePerformance ? (
        <Card
          className="performance-form-card"
          title="Add Performance Note"
          subtitle="Record concise, constructive employee performance feedback."
        >
          <form className="performance-form" onSubmit={handleFormSubmit}>
            <div className="performance-form-grid">
              <div className="form-field">
                <label htmlFor="employeeId" className="form-label">
                  Employee
                </label>
                <select
                  id="employeeId"
                  className="input"
                  value={formData.employeeId}
                  onChange={(event) => {
                    setFormData((prev) => ({ ...prev, employeeId: event.target.value }));
                    setFormErrors((prev) => ({ ...prev, employeeId: '' }));
                    setFormMessage('');
                  }}
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name} ({employee.email})
                    </option>
                  ))}
                </select>
                {formErrors.employeeId ? (
                  <p className="form-error">{formErrors.employeeId}</p>
                ) : null}
              </div>

              <div className="form-field">
                <label htmlFor="rating" className="form-label">
                  Rating
                </label>
                <select
                  id="rating"
                  className="input"
                  value={formData.rating}
                  onChange={(event) => {
                    setFormData((prev) => ({ ...prev, rating: event.target.value }));
                    setFormErrors((prev) => ({ ...prev, rating: '' }));
                    setFormMessage('');
                  }}
                >
                  {RATING_OPTIONS.map((value) => (
                    <option key={`form-rating-${value}`} value={value}>
                      {value} / 5
                    </option>
                  ))}
                </select>
                {formErrors.rating ? <p className="form-error">{formErrors.rating}</p> : null}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="note" className="form-label">
                Note
              </label>
              <textarea
                id="note"
                className="input textarea"
                placeholder="Add clear, professional feedback for this employee."
                rows={4}
                value={formData.note}
                onChange={(event) => {
                  setFormData((prev) => ({ ...prev, note: event.target.value }));
                  setFormErrors((prev) => ({ ...prev, note: '' }));
                  setFormMessage('');
                }}
              />
              {formErrors.note ? <p className="form-error">{formErrors.note}</p> : null}
            </div>

            {formMessage ? (
              <p className={formMessage.includes('successfully') ? 'form-success' : 'form-error'}>
                {formMessage}
              </p>
            ) : null}

            <div className="form-actions">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Performance Note'}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card className="filter-card" title="History Filters">
        <div className="performance-filter-grid">
          {canManagePerformance ? (
            <div className="form-field">
              <label htmlFor="filterEmployee" className="form-label">
                Employee
              </label>
              <select
                id="filterEmployee"
                className="input"
                value={selectedEmployee}
                onChange={(event) => setSelectedEmployee(event.target.value)}
              >
                <option value="">All employees</option>
                {employees.map((employee) => (
                  <option key={`filter-${employee._id}`} value={employee._id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="form-field">
            <label htmlFor="filterRating" className="form-label">
              Rating
            </label>
            <select
              id="filterRating"
              className="input"
              value={selectedRating}
              onChange={(event) => setSelectedRating(event.target.value)}
            >
              <option value="">All ratings</option>
              {RATING_OPTIONS.map((value) => (
                <option key={`rating-filter-${value}`} value={value}>
                  {value} / 5
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card className="departments-card">
        {error ? <p className="form-error">{error}</p> : null}
        {isLoading ? (
          <p className="muted-copy">Loading performance history...</p>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No performance notes found</p>
            <p className="empty-subtitle">
              {canManagePerformance
                ? 'Add a note to begin tracking employee performance history.'
                : 'Your performance notes will appear here when your manager adds them.'}
            </p>
          </div>
        ) : (
          <div className="performance-history-list">
            {notes.map((entry) => (
              <article key={entry._id} className="performance-note-card">
                <div className="performance-note-header">
                  <div className="performance-note-meta">
                    <p className="performance-note-title">
                      {entry.employeeId?.name || 'Employee'}
                    </p>
                    <p className="performance-note-subtitle">
                      Reviewed by {entry.managerId?.name || 'Manager'}
                      {entry.managerId?.email ? ` (${entry.managerId.email})` : ''}
                    </p>
                  </div>
                  <div className="performance-note-badges">
                    <span className="performance-rating-chip">{entry.rating}/5</span>
                    <span className="performance-date-chip">
                      {formatDate(entry.date || entry.createdAt)}
                    </span>
                  </div>
                </div>
                <p className="performance-note-body">{entry.note}</p>
              </article>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
