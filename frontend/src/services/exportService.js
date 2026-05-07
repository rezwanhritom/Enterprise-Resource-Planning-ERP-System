import api from './api.js';

const triggerCsvDownload = async (endpoint, filename) => {
  const response = await api.get(endpoint, { responseType: 'blob' });
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.setAttribute('download', filename);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

export const exportPayrollCsv = async () =>
  triggerCsvDownload('/export/payroll', 'payroll-report.csv');

export const exportInventoryCsv = async () =>
  triggerCsvDownload('/export/inventory', 'inventory-report.csv');

export const exportFinanceCsv = async () =>
  triggerCsvDownload('/export/finance', 'finance-report.csv');
