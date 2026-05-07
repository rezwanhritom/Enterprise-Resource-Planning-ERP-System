import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import ChartCard from '../../components/charts/ChartCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const DASHBOARD_STATS = [
  { label: 'Headcount', value: '128', change: '+4 this month' },
  { label: 'Departments', value: '12', change: '2 pending updates' },
  { label: 'Attendance Today', value: '94%', change: '6 records pending' },
  { label: 'Open Tasks', value: '23', change: '8 require approval' },
];

export default function DashboardPage() {
  const { user } = useAuth();

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

      <section className="kpi-grid">
        {DASHBOARD_STATS.map((item) => (
          <Card key={item.label} className="kpi-card">
            <p className="kpi-label">{item.label}</p>
            <h3 className="kpi-value">{item.value}</h3>
            <p className="kpi-change">{item.change}</p>
          </Card>
        ))}
      </section>

      <section className="dashboard-grid">
        <ChartCard
          title="Operational Trends"
          subtitle="Reserved for utilization and throughput analytics"
        />
        <ChartCard
          title="Team Activity"
          subtitle="Reserved for approvals and workflow movement"
        />
      </section>

      <section className="dashboard-grid dashboard-grid-single">
        <Card
          title="Recent Activity"
          subtitle="Team actions and workflow timeline foundation"
        >
          <p className="muted-copy">
            Activity feeds, approval logs, and module events will appear in this
            area once Sprint 3 modules are connected.
          </p>
        </Card>
      </section>
    </DashboardLayout>
  );
}
