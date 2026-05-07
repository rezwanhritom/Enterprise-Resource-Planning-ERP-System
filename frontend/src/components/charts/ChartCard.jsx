import { ResponsiveContainer } from 'recharts';
import Card from '../ui/Card.jsx';

export default function ChartCard({
  title,
  subtitle,
  minHeight = 280,
  children,
  className = '',
  emptyMessage = 'Chart data will appear here once the module is connected.',
  isLoading = false,
}) {
  return (
    <Card title={title} subtitle={subtitle} className={`chart-card ${className}`.trim()}>
      <div className="chart-card-canvas" style={{ minHeight }}>
        {isLoading ? (
          <div className="chart-card-placeholder">
            <p>Loading chart...</p>
          </div>
        ) : children ? (
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        ) : (
          <div className="chart-card-placeholder">
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
