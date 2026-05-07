import Attendance, { ATTENDANCE_STATUS } from '../models/Attendance.js';
import Department from '../models/Department.js';
import Inventory from '../models/Inventory.js';
import Payroll from '../models/Payroll.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

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

  const [
    totalEmployees,
    presentToday,
    totalDepartments,
    lowStockItems,
    attendanceRows,
    salaryExpenseRows,
  ] =
    await Promise.all([
      User.countDocuments(),
      Attendance.countDocuments({
        date: today,
        status: ATTENDANCE_STATUS.PRESENT,
      }),
      Department.countDocuments(),
      Inventory.countDocuments({ isLowStock: true }),
      Attendance.aggregate([
        {
          $match: {
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
        {
          $group: {
            _id: null,
            totalSalaryExpense: { $sum: '$finalSalary' },
          },
        },
      ]),
    ]);

  const totalSalaryExpense = salaryExpenseRows[0]?.totalSalaryExpense ?? 0;

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
    charts: {
      attendanceChart: buildAttendanceChart(attendanceRows, sevenDaysAgo),
      expenseChart: [],
      inventoryChart: [],
    },
  };

  return res.status(200).json({
    success: true,
    data,
  });
});
