import Finance, { FINANCE_TYPE } from '../models/Finance.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getCompanyId, companyFilter } from '../utils/companyScope.js';

const parseAmount = (amount) => {
  const parsed = Number(amount);
  if (!Number.isFinite(parsed)) {
    throw new ApiError(400, 'Amount must be a valid number');
  }
  if (parsed < 0) {
    throw new ApiError(400, 'Amount cannot be negative');
  }
  return parsed;
};

const parseCategory = (category) => {
  if (typeof category !== 'string' || !category.trim()) {
    throw new ApiError(400, 'Category is required');
  }
  return category.trim();
};

const parseTypeFilter = (type) => {
  if (type === undefined) return undefined;
  const value = String(type).trim().toLowerCase();
  if (!Object.values(FINANCE_TYPE).includes(value)) {
    throw new ApiError(400, 'Invalid type filter');
  }
  return value;
};

const parseDateFilter = (month, year) => {
  if (month === undefined && year === undefined) return undefined;

  const parsedYear =
    year !== undefined ? Number.parseInt(String(year), 10) : new Date().getFullYear();
  if (Number.isNaN(parsedYear) || parsedYear < 1970 || parsedYear > 3000) {
    throw new ApiError(400, 'Year filter must be between 1970 and 3000');
  }

  if (month === undefined) {
    return {
      $gte: new Date(parsedYear, 0, 1),
      $lt: new Date(parsedYear + 1, 0, 1),
    };
  }

  const parsedMonth = Number.parseInt(String(month), 10);
  if (Number.isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    throw new ApiError(400, 'Month filter must be between 1 and 12');
  }

  return {
    $gte: new Date(parsedYear, parsedMonth - 1, 1),
    $lt: new Date(parsedYear, parsedMonth, 1),
  };
};

const buildQuery = (query = {}, user) => {
  const filter = { ...companyFilter(user) };
  const type = parseTypeFilter(query.type);
  if (type) filter.type = type;

  const date = parseDateFilter(query.month, query.year);
  if (date) filter.date = date;

  if (typeof query.search === 'string' && query.search.trim()) {
    filter.category = { $regex: query.search.trim(), $options: 'i' };
  }

  return filter;
};

const createFinanceEntry = async (req, res, type) => {
  const companyId = getCompanyId(req.user);
  if (!companyId) {
    throw new ApiError(400, 'User is not linked to a company');
  }

  const amount = parseAmount(req.body?.amount);
  const category = parseCategory(req.body?.category);
  const description =
    typeof req.body?.description === 'string' ? req.body.description.trim() : '';

  const entry = await Finance.create({
    type,
    amount,
    category,
    description,
    createdBy: req.user?._id,
    company: companyId,
  });

  return res.status(201).json({
    success: true,
    message: `${type === FINANCE_TYPE.EXPENSE ? 'Expense' : 'Revenue'} entry added successfully`,
    data: entry,
  });
};

export const addExpense = asyncHandler(async (req, res) =>
  createFinanceEntry(req, res, FINANCE_TYPE.EXPENSE)
);

export const addRevenue = asyncHandler(async (req, res) =>
  createFinanceEntry(req, res, FINANCE_TYPE.REVENUE)
);

export const getTransactions = asyncHandler(async (req, res) => {
  const filter = buildQuery(req.query || {}, req.user);

  const transactions = await Finance.find(filter)
    .sort({ date: -1, createdAt: -1 })
    .limit(100);

  return res.status(200).json({
    success: true,
    message: 'Finance transactions fetched successfully',
    data: transactions,
  });
});

export const getReports = asyncHandler(async (req, res) => {
  const filter = buildQuery(req.query || {}, req.user);

  const [summaryRows, recentTransactions] = await Promise.all([
    Finance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]),
    Finance.find(filter).sort({ date: -1, createdAt: -1 }).limit(15),
  ]);

  const totalExpenses =
    summaryRows.find((row) => row._id === FINANCE_TYPE.EXPENSE)?.total ?? 0;
  const totalRevenue =
    summaryRows.find((row) => row._id === FINANCE_TYPE.REVENUE)?.total ?? 0;

  return res.status(200).json({
    success: true,
    message: 'Finance report fetched successfully',
    data: {
      totalExpenses,
      totalRevenue,
      netBalance: totalRevenue - totalExpenses,
      recentTransactions,
    },
  });
});
