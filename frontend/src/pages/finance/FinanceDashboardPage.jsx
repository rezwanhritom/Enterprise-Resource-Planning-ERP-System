import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import ChartCard from '../../components/charts/ChartCard.jsx';
import { getReports, getTransactions } from '../../services/financeService.js';

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

export default function FinanceDashboardPage() {
  const [report, setReport] = useState({
    totalExpenses: 0,
    totalRevenue: 0,
    netBalance: 0,
    recentTransactions: [],
  });
  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async (filter = typeFilter, searchText = search) => {
    try {
      setIsLoading(true);
      setError('');
      const [reportData, transactionData] = await Promise.all([
        getReports(filter ? { type: filter } : {}),
        getTransactions({
          type: filter || undefined,
          search: searchText.trim() || undefined,
        }),
      ]);
      setReport(
        reportData || {
          totalExpenses: 0,
          totalRevenue: 0,
          netBalance: 0,
          recentTransactions: [],
        }
      );
      setTransactions(transactionData);
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message || 'Unable to load finance records.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(typeFilter, search);
  }, [typeFilter, search]);

  const summaryChartData = useMemo(
    () => [
      { name: 'Revenue', amount: report.totalRevenue || 0 },
      { name: 'Expenses', amount: report.totalExpenses || 0 },
    ],
    [report]
  );

  const trendPlaceholderData = useMemo(
    () =>
      (report.recentTransactions || [])
        .slice(0, 8)
        .reverse()
        .map((item) => ({
          date: new Date(item.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          }),
          amount: item.amount,
        })),
    [report.recentTransactions]
  );

  return (
    <DashboardLayout>
      <section className="page-header">
        <div>
          <h2 className="page-title">Finance Dashboard</h2>
          <p className="page-subtitle">
            Review financial performance, recent activity, and transaction health.
          </p>
        </div>
        <Link to="/finance/add">
          <Button>Add Entry</Button>
        </Link>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="kpi-grid finance-kpi-grid">
        <Card className="kpi-card">
          <p className="kpi-label">Total Revenue</p>
          <h3 className="kpi-value">{formatCurrency(report.totalRevenue)}</h3>
          <p className="kpi-change">Recognized revenue entries</p>
        </Card>
        <Card className="kpi-card">
          <p className="kpi-label">Total Expenses</p>
          <h3 className="kpi-value">{formatCurrency(report.totalExpenses)}</h3>
          <p className="kpi-change">Operational expense entries</p>
        </Card>
        <Card className="kpi-card">
          <p className="kpi-label">Net Balance</p>
          <h3 className="kpi-value">{formatCurrency(report.netBalance)}</h3>
          <p className="kpi-change">Revenue minus expenses</p>
        </Card>
      </section>

      <section className="dashboard-grid">
        <ChartCard
          title="Revenue vs Expenses"
          subtitle="Current financial distribution"
          isLoading={isLoading}
          emptyMessage="No finance entries to compare yet."
        >
          {summaryChartData.some((item) => item.amount > 0) ? (
            <BarChart data={summaryChartData} margin={{ top: 8, right: 12, left: -8 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#4f46e5" />
            </BarChart>
          ) : null}
        </ChartCard>

        <ChartCard
          title="Recent Financial Trend"
          subtitle="Short-term transaction movement"
          isLoading={isLoading}
          emptyMessage="Trend data will appear after finance entries are added."
        >
          {trendPlaceholderData.length > 0 ? (
            <LineChart data={trendPlaceholderData} margin={{ top: 8, right: 12, left: -8 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#0f766e"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </LineChart>
          ) : null}
        </ChartCard>
      </section>

      <Card className="filter-card">
        <div className="finance-filter-grid">
          <div className="form-field">
            <label htmlFor="finance-type" className="form-label">
              Type
            </label>
            <select
              id="finance-type"
              className="input"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="">All</option>
              <option value="revenue">Revenue</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="finance-search" className="form-label">
              Category search
            </label>
            <input
              id="finance-search"
              className="input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search category..."
            />
          </div>
        </div>
      </Card>

      <Card className="departments-card">
        {isLoading ? (
          <p className="muted-copy">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No transactions available</p>
            <p className="empty-subtitle">
              Add finance entries to start building your reporting timeline.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item) => (
                  <tr key={item._id}>
                    <td data-label="Type">
                      <span className={`status-badge status-${item.type}`}>
                        {item.type}
                      </span>
                    </td>
                    <td data-label="Amount" className="cell-strong">
                      {formatCurrency(item.amount)}
                    </td>
                    <td data-label="Category">{item.category}</td>
                    <td data-label="Date">{formatDate(item.date)}</td>
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
