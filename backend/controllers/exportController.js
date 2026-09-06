import Finance from '../models/Finance.js';
import Inventory from '../models/Inventory.js';
import Payroll from '../models/Payroll.js';
import asyncHandler from '../utils/asyncHandler.js';
import exportToCsv from '../utils/exportToCsv.js';
import { companyFilter } from '../utils/companyScope.js';

const sendCsvAttachment = (res, filename, rows) => {
  const csv = exportToCsv(rows);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(200).send(csv);
};

export const exportPayrollCsv = asyncHandler(async (req, res) => {
  const payrolls = await Payroll.find({ ...companyFilter(req.user) })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

  const rows = payrolls.map((item) => ({
    employee: item.userId?.name || '',
    employeeEmail: item.userId?.email || '',
    month: item.month,
    baseSalary: item.baseSalary,
    bonus: item.bonus,
    deductions: item.deductions,
    finalSalary: item.finalSalary,
    attendanceDays: item.attendanceDays,
  }));

  return sendCsvAttachment(res, 'payroll-report.csv', rows);
});

export const exportInventoryCsv = asyncHandler(async (req, res) => {
  const inventory = await Inventory.find({ ...companyFilter(req.user) }).sort({
    createdAt: -1,
  });

  const rows = inventory.map((item) => ({
    itemName: item.itemName,
    quantity: item.quantity,
    threshold: item.threshold,
    isLowStock: item.isLowStock ? 'Yes' : 'No',
  }));

  return sendCsvAttachment(res, 'inventory-report.csv', rows);
});

export const exportFinanceCsv = asyncHandler(async (req, res) => {
  const transactions = await Finance.find({ ...companyFilter(req.user) }).sort({
    date: -1,
    createdAt: -1,
  });

  const rows = transactions.map((item) => ({
    type: item.type,
    amount: item.amount,
    category: item.category,
    date: item.date?.toISOString?.() || '',
  }));

  return sendCsvAttachment(res, 'finance-report.csv', rows);
});
