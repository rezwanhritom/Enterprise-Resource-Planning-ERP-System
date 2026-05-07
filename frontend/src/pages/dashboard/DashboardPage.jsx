import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import AttendanceChart from '../../components/charts/AttendanceChart.jsx';
import ExpenseChart from '../../components/charts/ExpenseChart.jsx';
import InventoryChart from '../../components/charts/InventoryChart.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getDashboardSummary } from '../../services/dashboardService.js';

const formatCurrency = (value) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await getDashboardSummary();
        setSummary(response);
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message ||
          'Unable to load dashboard summary right now.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, []);

  const kpiCards = useMemo(
    () => [
      {
        label: 'Total Employees',
        value: summary?.counts?.totalEmployees ?? 0,
        helper: 'Organization-wide employee records',
      },
      {
        label: 'Present Today',
        value: summary?.counts?.presentToday ?? 0,
        helper: 'Attendance records marked as present today',
      },
      {
        label: 'Total Salary Expense',
        value: formatCurrency(summary?.salarySummary?.totalSalaryExpense ?? 0),
        helper: 'Payroll module placeholder',
      },
      {
        label: 'Low Stock Items',
        value: summary?.counts?.lowStockItems ?? 0,
        helper: 'Inventory module placeholder',
      },
    ],
    [summary]
  );

  return (
    <DashboardLayout>
      <section className="welcome-section">
        <h2 className="welcome-title">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h2>
        <p className="welcome-subtitle">
          Your ERP workspace is ready. Core modules and analytics will appear
          here as your team setup expands.
        </p>
      </section>

      {error ? <p className="form-error dashboard-error">{error}</p> : null}

      <section className="kpi-grid">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={`kpi-skeleton-${index}`} className="kpi-card kpi-card-skeleton">
                <div className="skeleton skeleton-line skeleton-line-sm" />
                <div className="skeleton skeleton-line skeleton-line-lg" />
                <div className="skeleton skeleton-line skeleton-line-md" />
              </Card>
            ))
          : kpiCards.map((item) => (
              <Card key={item.label} className="kpi-card">
                <p className="kpi-label">{item.label}</p>
                <h3 className="kpi-value">{item.value}</h3>
                <p className="kpi-change">{item.helper}</p>
              </Card>
            ))}
      </section>

      <section className="dashboard-grid">
        <AttendanceChart
          data={summary?.charts?.attendanceChart ?? []}
          isLoading={isLoading}
        />
        <ExpenseChart
          data={summary?.charts?.expenseChart ?? []}
          isLoading={isLoading}
        />
      </section>

      <section className="dashboard-grid dashboard-grid-single">
        <InventoryChart
          data={summary?.charts?.inventoryChart ?? []}
          isLoading={isLoading}
        />
      </section>

      <section className="dashboard-grid dashboard-grid-single">
        <Card
          title="Module Readiness"
          subtitle="Current dashboard integrations and expansion points"
        >
          <ul className="dashboard-notes">
            <li>Employee, department, and attendance KPIs are now live.</li>
            <li>Attendance weekly trend is sourced from real records.</li>
            <li>Payroll and inventory chart areas are scaffolded for Sprint 3.</li>
          </ul>
        </Card>
      </section>
    </DashboardLayout>
  );
}
