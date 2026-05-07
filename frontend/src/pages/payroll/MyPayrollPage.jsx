import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import { getMyPayrolls } from '../../services/payrollService.js';

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

export default function MyPayrollPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMyPayrolls = async () => {
      try {
        setIsLoading(true);
        setError('');
        const records = await getMyPayrolls();
        setPayrolls(records);
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message || 'Unable to load your payroll history.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadMyPayrolls();
  }, []);

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">My Payroll</h2>
          <p className="page-subtitle">
            Review monthly payslips and compensation breakdown in one place.
          </p>
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      {isLoading ? (
        <Card>
          <p className="muted-copy">Loading payroll history...</p>
        </Card>
      ) : payrolls.length === 0 ? (
        <Card>
          <div className="empty-state">
            <p className="empty-title">No payroll records found</p>
            <p className="empty-subtitle">
              Payroll entries will appear here after your HR team generates them.
            </p>
          </div>
        </Card>
      ) : (
        <section className="payroll-slip-grid">
          {payrolls.map((item) => (
            <Card
              key={item._id}
              className="payroll-slip-card"
              title={`Payslip - ${item.month}`}
              subtitle={`Generated on ${formatDate(item.createdAt)}`}
            >
              <dl className="profile-list payroll-breakdown-list">
                <div>
                  <dt>Base Salary</dt>
                  <dd>{formatCurrency(item.baseSalary)}</dd>
                </div>
                <div>
                  <dt>Attendance Days</dt>
                  <dd>{item.attendanceDays ?? 0}</dd>
                </div>
                <div>
                  <dt>Deductions</dt>
                  <dd>{formatCurrency(item.deductions)}</dd>
                </div>
                <div>
                  <dt>Bonus</dt>
                  <dd>{formatCurrency(item.bonus)}</dd>
                </div>
                <div className="payroll-final-row">
                  <dt>Final Salary</dt>
                  <dd>{formatCurrency(item.finalSalary)}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </section>
      )}
    </DashboardLayout>
  );
}
