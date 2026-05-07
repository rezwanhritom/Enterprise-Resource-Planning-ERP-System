import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

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

      <section className="dashboard-grid">
        <Card
          title="Operational Snapshot"
          subtitle="High-level performance tiles will live here"
        >
          <p className="muted-copy">Placeholder for KPI cards and alerts.</p>
        </Card>
        <Card
          title="Recent Activity"
          subtitle="Team actions and workflow timeline"
        >
          <p className="muted-copy">
            Placeholder for approval logs and module activity feed.
          </p>
        </Card>
      </section>
    </DashboardLayout>
  );
}
