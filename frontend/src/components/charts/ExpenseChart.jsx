import ChartCard from './ChartCard.jsx';

export default function ExpenseChart({ data = [], isLoading = false }) {
  const dataLength = Array.isArray(data) ? data.length : 0;

  return (
    <ChartCard
      title="Expense Summary"
      subtitle={
        dataLength
          ? 'Expense analytics connected'
          : 'Payroll and operating expenses will appear once payroll is enabled'
      }
      isLoading={isLoading}
      emptyMessage="Payroll analytics is not available yet."
    />
  );
}
