import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from './ChartCard.jsx';

export default function AttendanceChart({ data = [], isLoading = false }) {
  const hasData = data.some((item) => item.present > 0);

  return (
    <ChartCard
      title="Weekly Attendance"
      subtitle="Present employees over the last 7 days"
      isLoading={isLoading}
      emptyMessage="No attendance activity found for this week."
      className="attendance-chart-card"
    >
      {hasData ? (
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#6b7280' }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#6b7280' }} />
          <Tooltip
            cursor={{ stroke: '#cbd5e1', strokeDasharray: '3 3' }}
            contentStyle={{
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
            }}
          />
          <Area
            type="monotone"
            dataKey="present"
            stroke="#4f46e5"
            strokeWidth={2}
            fill="url(#attendanceFill)"
          />
          <Line
            type="monotone"
            dataKey="present"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 1.5, fill: '#fff' }}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      ) : null}
    </ChartCard>
  );
}
