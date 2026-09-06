import Supplier from '../models/Supplier.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getCompanyId, companyFilter } from '../utils/companyScope.js';

const sanitizeRequiredText = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, `${label} is required`);
  }
  return value.trim();
};

export const createSupplier = asyncHandler(async (req, res) => {
  const companyId = getCompanyId(req.user);
  if (!companyId) {
    throw new ApiError(400, 'User is not linked to a company');
  }

  const name = sanitizeRequiredText(req.body?.name, 'Supplier name');
  const contact = sanitizeRequiredText(req.body?.contact, 'Supplier contact');
  const address = typeof req.body?.address === 'string' ? req.body.address.trim() : '';

  const duplicate = await Supplier.findOne({
    name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    ...companyFilter(req.user),
  }).select('_id');

  if (duplicate) {
    throw new ApiError(409, 'Supplier with this name already exists');
  }

  const supplier = await Supplier.create({
    name,
    contact,
    address,
    company: companyId,
  });

  return res.status(201).json({
    success: true,
    message: 'Supplier created successfully',
    data: supplier,
  });
});

export const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({ ...companyFilter(req.user) }).sort({
    name: 1,
  });
  return res.status(200).json({
    success: true,
    message: 'Suppliers fetched successfully',
    data: suppliers,
  });
});
