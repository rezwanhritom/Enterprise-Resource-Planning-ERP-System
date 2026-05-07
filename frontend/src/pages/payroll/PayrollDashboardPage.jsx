import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { getAllPayrolls } from '../../services/payrollService.js';

const formatCurrency = (value) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (dateValue) =>
  new Date(dateValue).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export default function PayrollDashboardPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPayrolls = async () => {
      try {
        setIsLoading(true);
        setError('');
        const records = await getAllPayrolls();
        setPayrolls(records);
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message || 'Unable to load payroll records.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadPayrolls();
  }, []);

  const summary = useMemo(() => {
    const totalPayrolls = payrolls.length;
    const totalExpense = payrolls.reduce(
      (sum, item) => sum + Number(item.finalSalary || 0),
      0
    );
    const activeEmployees = new Set(payrolls.map((item) => item.userId?._id)).size;

    return { totalPayrolls, totalExpense, activeEmployees };
  }, [payrolls]);

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Payroll Dashboard</h2>
          <p className="page-subtitle">
            Review payroll entries, monthly payouts, and employee compensation records.
          </p>
        </div>
        <Link to="/payroll/generate">
          <Button>Generate Payroll</Button>
        </Link>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="kpi-grid payroll-kpi-grid">
        <Card className="kpi-card">
          <p className="kpi-label">Total Payroll Records</p>
          <h3 className="kpi-value">{summary.totalPayrolls}</h3>
          <p className="kpi-change">Historical payroll entries</p>
        </Card>
        <Card className="kpi-card">
          <p className="kpi-label">Salary Expense</p>
          <h3 className="kpi-value">{formatCurrency(summary.totalExpense)}</h3>
          <p className="kpi-change">Combined payout across records</p>
        </Card>
        <Card className="kpi-card">
          <p className="kpi-label">Employees Covered</p>
          <h3 className="kpi-value">{summary.activeEmployees}</h3>
          <p className="kpi-change">Unique employees in payroll history</p>
        </Card>
      </section>

      <Card className="departments-card">
        {isLoading ? (
          <p className="muted-copy">Loading payroll records...</p>
        ) : payrolls.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No payroll records available</p>
            <p className="empty-subtitle">
              Generate payroll to start building your compensation history.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month</th>
                  <th>Final Salary</th>
                  <th>Attendance Days</th>
                  <th>Generated Date</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((item) => (
                  <tr key={item._id}>
                    <td data-label="Employee" className="cell-strong">
                      <div className="payroll-employee-cell">
                        <span>{item.userId?.name || '-'}</span>
                        <small>{item.userId?.email || ''}</small>
                      </div>
                    </td>
                    <td data-label="Month">{item.month}</td>
                    <td data-label="Final Salary">{formatCurrency(item.finalSalary)}</td>
                    <td data-label="Attendance Days">{item.attendanceDays ?? 0}</td>
                    <td data-label="Generated Date">{formatDate(item.createdAt)}</td>
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
