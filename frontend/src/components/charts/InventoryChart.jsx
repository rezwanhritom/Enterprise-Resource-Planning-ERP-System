import ChartCard from './ChartCard.jsx';

export default function InventoryChart({ data = [], isLoading = false }) {
  const dataLength = Array.isArray(data) ? data.length : 0;

  return (
    <ChartCard
      title="Inventory Health"
      subtitle={
        dataLength
          ? 'Inventory insights connected'
          : 'Inventory analytics will appear once stock tracking is enabled'
      }
      isLoading={isLoading}
      emptyMessage="Inventory insights are not available yet."
    />
  );
}
