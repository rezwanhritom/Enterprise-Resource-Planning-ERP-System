import Attendance, { ATTENDANCE_STATUS } from '../models/Attendance.js';
import Department from '../models/Department.js';
import Finance, { FINANCE_TYPE } from '../models/Finance.js';
import Inventory from '../models/Inventory.js';
import Payroll from '../models/Payroll.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { companyFilter } from '../utils/companyScope.js';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getStartOfDay = (date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const buildAttendanceChart = (rows, startDate) => {
  const rowMap = new Map(
    rows.map((row) => {
      const key = new Date(row._id).toISOString().slice(0, 10);
      return [key, row.present];
    })
  );

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const key = date.toISOString().slice(0, 10);

    return {
      day: DAY_LABELS[date.getDay()],
      present: rowMap.get(key) ?? 0,
    };
  });
};

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const today = getStartOfDay(new Date());
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  const scope = companyFilter(req.user);

  const [
    totalEmployees,
    presentToday,
    totalDepartments,
    lowStockItems,
    attendanceRows,
    salaryExpenseRows,
    financeRows,
  ] =
    await Promise.all([
      User.countDocuments(scope),
      Attendance.countDocuments({
        ...scope,
        date: today,
        status: ATTENDANCE_STATUS.PRESENT,
      }),
      Department.countDocuments(scope),
      Inventory.countDocuments({ ...scope, isLowStock: true }),
      Attendance.aggregate([
        {
          $match: {
            ...scope,
            date: { $gte: sevenDaysAgo, $lte: today },
            status: ATTENDANCE_STATUS.PRESENT,
          },
        },
        {
          $group: {
            _id: '$date',
            present: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Payroll.aggregate([
        { $match: scope },
        {
          $group: {
            _id: null,
            totalSalaryExpense: { $sum: '$finalSalary' },
          },
        },
      ]),
      Finance.aggregate([
        { $match: scope },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ]),
    ]);

  const totalSalaryExpense = salaryExpenseRows[0]?.totalSalaryExpense ?? 0;
  const totalRevenue =
    financeRows.find((row) => row._id === FINANCE_TYPE.REVENUE)?.total ?? 0;
  const totalExpenses =
    financeRows.find((row) => row._id === FINANCE_TYPE.EXPENSE)?.total ?? 0;

  const data = {
    counts: {
      totalEmployees,
      presentToday,
      totalDepartments,
      lowStockItems,
    },
    salarySummary: {
      totalSalaryExpense,
    },
    financialSummary: {
      totalRevenue,
      totalExpenses,
      netBalance: totalRevenue - totalExpenses,
    },
    charts: {
      attendanceChart: buildAttendanceChart(attendanceRows, sevenDaysAgo),
      expenseChart: [],
      inventoryChart: [],
    },
  };

  return res.status(200).json({
    success: true,
    message: 'Dashboard summary fetched successfully',
    data,
  });
});
