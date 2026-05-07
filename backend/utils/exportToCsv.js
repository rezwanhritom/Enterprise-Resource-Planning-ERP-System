const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const exportToCsv = (rows = []) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return '';
  }

  const headerSet = new Set();
  for (const row of rows) {
    Object.keys(row || {}).forEach((key) => headerSet.add(key));
  }

  const headers = Array.from(headerSet);
  const lines = [];
  lines.push(headers.map(escapeCsvValue).join(','));

  for (const row of rows) {
    const line = headers
      .map((header) => escapeCsvValue(row?.[header] ?? ''))
      .join(',');
    lines.push(line);
  }

  return lines.join('\n');
};

export default exportToCsv;
