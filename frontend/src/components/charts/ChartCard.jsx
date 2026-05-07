import { ResponsiveContainer } from 'recharts';
import Card from '../ui/Card.jsx';

export default function ChartCard({
  title,
  subtitle,
  minHeight = 280,
  children,
  className = '',
}) {
  return (
    <Card title={title} subtitle={subtitle} className={`chart-card ${className}`.trim()}>
      <div className="chart-card-canvas" style={{ minHeight }}>
        {children ? (
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        ) : (
          <div className="chart-card-placeholder">
            <p>Chart area ready for analytics modules.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
