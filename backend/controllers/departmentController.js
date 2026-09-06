import mongoose from 'mongoose';
import Department from '../models/Department.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getCompanyId, companyFilter } from '../utils/companyScope.js';

const normalizeName = (value = '') => value.trim();
const normalizeDescription = (value = '') => value.trim();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findDuplicateByName = async (name, companyId, excludeId = null) => {
  const duplicateQuery = {
    name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' },
    ...(companyId ? { company: companyId } : {}),
  };

  if (excludeId) {
    duplicateQuery._id = { $ne: excludeId };
  }

  return Department.findOne(duplicateQuery);
};

export const createDepartment = asyncHandler(async (req, res) => {
  const name = normalizeName(req.body?.name);
  const description = normalizeDescription(req.body?.description);
  const companyId = getCompanyId(req.user);

  if (!companyId) {
    throw new ApiError(400, 'User is not linked to a company');
  }

  if (!name) {
    throw new ApiError(400, 'Department name is required');
  }

  const duplicateDepartment = await findDuplicateByName(name, companyId);
  if (duplicateDepartment) {
    throw new ApiError(409, 'Department name already exists');
  }

  const department = await Department.create({
    name,
    description,
    company: companyId,
  });

  return res.status(201).json({
    success: true,
    message: 'Department created successfully',
    data: department,
  });
});

export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({
    ...companyFilter(req.user),
  }).sort({ name: 1 });

  return res.status(200).json({
    success: true,
    message: 'Departments fetched successfully',
    data: departments,
  });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid department ID');
  }

  const name =
    typeof req.body?.name === 'string' ? normalizeName(req.body.name) : undefined;
  const description =
    typeof req.body?.description === 'string'
      ? normalizeDescription(req.body.description)
      : undefined;

  if (typeof name !== 'undefined' && !name) {
    throw new ApiError(400, 'Department name is required');
  }

  const existingDepartment = await Department.findOne({
    _id: id,
    ...companyFilter(req.user),
  });
  if (!existingDepartment) {
    throw new ApiError(404, 'Department not found');
  }

  if (typeof name !== 'undefined') {
    const companyId = getCompanyId(req.user);
    const duplicateDepartment = await findDuplicateByName(name, companyId, id);
    if (duplicateDepartment) {
      throw new ApiError(409, 'Department name already exists');
    }
    existingDepartment.name = name;
  }

  if (typeof description !== 'undefined') {
    existingDepartment.description = description;
  }

  const updatedDepartment = await existingDepartment.save();

  return res.status(200).json({
    success: true,
    message: 'Department updated successfully',
    data: updatedDepartment,
  });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid department ID');
  }

  const department = await Department.findOne({
    _id: id,
    ...companyFilter(req.user),
  });
  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  await department.deleteOne();

  return res.status(200).json({
    success: true,
    message: 'Department deleted successfully',
  });
});
