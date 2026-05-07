import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import { getAllEmployees } from '../../services/employeeService.js';
import { generatePayroll } from '../../services/payrollService.js';

const INITIAL_FORM = {
  userId: '',
  month: '',
  baseSalary: '',
  deductions: '',
  bonus: '',
};

const isValidMonth = (value) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

export default function GeneratePayrollPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsLoadingEmployees(true);
        const records = await getAllEmployees();
        setEmployees(records);
      } catch {
        setEmployees([]);
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  const monthError = useMemo(() => {
    if (!formData.month) return '';
    return isValidMonth(formData.month) ? '' : 'Month must be in YYYY-MM format.';
  }, [formData.month]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setStatusMessage('');
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.userId) nextErrors.userId = 'Employee is required.';
    if (!formData.month) nextErrors.month = 'Month is required.';
    else if (!isValidMonth(formData.month)) {
      nextErrors.month = 'Use YYYY-MM format.';
    }

    const moneyFields = ['baseSalary', 'deductions', 'bonus'];
    moneyFields.forEach((field) => {
      const raw = formData[field];
      if (field === 'baseSalary' && raw === '') {
        nextErrors[field] = 'Base salary is required.';
        return;
      }
      if (raw === '') return;
      const parsed = Number(raw);
      if (!Number.isFinite(parsed) || parsed < 0) {
        nextErrors[field] = 'Value must be a valid non-negative number.';
      }
    });

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      setStatusMessage('');
      await generatePayroll({
        userId: formData.userId,
        month: formData.month,
        baseSalary: Number(formData.baseSalary),
        deductions: formData.deductions === '' ? 0 : Number(formData.deductions),
        bonus: formData.bonus === '' ? 0 : Number(formData.bonus),
      });

      setStatusMessage('Payroll generated successfully.');
      setFormData(INITIAL_FORM);
      setTimeout(() => navigate('/payroll', { replace: true }), 900);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || 'Unable to generate payroll.';
      setStatusMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Generate Payroll</h2>
          <p className="page-subtitle">
            Create monthly payroll records with controlled salary adjustments.
          </p>
        </div>
        <Link to="/payroll">
          <Button variant="secondary">Back to Payroll Dashboard</Button>
        </Link>
      </section>

      <Card className="department-form-card">
        <form className="department-form payroll-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="userId" className="form-label">
              Employee
            </label>
            <select
              id="userId"
              name="userId"
              className="input"
              value={formData.userId}
              onChange={handleChange}
              disabled={isLoadingEmployees}
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name} ({employee.email})
                </option>
              ))}
            </select>
            {errors.userId ? <p className="form-error">{errors.userId}</p> : null}
          </div>

          <Input
            id="month"
            name="month"
            label="Month (YYYY-MM)"
            placeholder="2026-05"
            value={formData.month}
            onChange={handleChange}
          />
          {errors.month || monthError ? (
            <p className="form-error">{errors.month || monthError}</p>
          ) : null}

          <Input
            id="baseSalary"
            name="baseSalary"
            label="Base Salary"
            type="number"
            min="0"
            step="0.01"
            placeholder="5000"
            value={formData.baseSalary}
            onChange={handleChange}
          />
          {errors.baseSalary ? <p className="form-error">{errors.baseSalary}</p> : null}

          <div className="payroll-adjustment-grid">
            <Input
              id="deductions"
              name="deductions"
              label="Deductions"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={formData.deductions}
              onChange={handleChange}
            />
            <Input
              id="bonus"
              name="bonus"
              label="Bonus"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={formData.bonus}
              onChange={handleChange}
            />
          </div>
          {errors.deductions ? <p className="form-error">{errors.deductions}</p> : null}
          {errors.bonus ? <p className="form-error">{errors.bonus}</p> : null}

          {statusMessage ? (
            <p
              className={
                statusMessage.toLowerCase().includes('success')
                  ? 'form-success'
                  : 'form-error'
              }
            >
              {statusMessage}
            </p>
          ) : null}

          <div className="form-actions">
            <Button type="submit" disabled={isSubmitting || isLoadingEmployees}>
              {isSubmitting ? 'Generating...' : 'Generate Payroll'}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}
