import mongoose from 'mongoose';
import Inventory from '../models/Inventory.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const normalizeItemName = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, 'Item name is required');
  }
  return value.trim();
};

const parseNonNegativeNumber = (value, fieldName, { required = false } = {}) => {
  if (value === undefined || value === null || value === '') {
    if (required) throw new ApiError(400, `${fieldName} is required`);
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new ApiError(400, `${fieldName} must be a valid number`);
  }
  if (parsed < 0) {
    throw new ApiError(400, `${fieldName} cannot be negative`);
  }
  return parsed;
};

const parseSupplierId = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, 'Supplier must be a valid user');
  }
  return value;
};

export const addItem = asyncHandler(async (req, res) => {
  const itemName = normalizeItemName(req.body?.itemName);
  const quantity = parseNonNegativeNumber(req.body?.quantity, 'Quantity', {
    required: true,
  });
  const threshold = parseNonNegativeNumber(req.body?.threshold, 'Threshold', {
    required: true,
  });
  const supplierId = parseSupplierId(req.body?.supplierId);

  const duplicate = await Inventory.findOne({
    itemName: { $regex: `^${itemName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
  }).select('_id');
  if (duplicate) {
    throw new ApiError(409, 'An inventory item with this name already exists');
  }

  if (supplierId) {
    const supplier = await User.findById(supplierId).select('_id');
    if (!supplier) {
      throw new ApiError(404, 'Supplier user not found');
    }
  }

  const created = await Inventory.create({
    itemName,
    quantity,
    threshold,
    supplierId,
  });

  const populated = await Inventory.findById(created._id).populate(
    'supplierId',
    'name email'
  );

  return res.status(201).json({
    success: true,
    message: 'Inventory item added successfully',
    data: populated,
  });
});

export const updateStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid inventory item id');
  }

  const item = await Inventory.findById(id);
  if (!item) {
    throw new ApiError(404, 'Inventory item not found');
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'quantity')) {
    item.quantity = parseNonNegativeNumber(req.body.quantity, 'Quantity', {
      required: true,
    });
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'threshold')) {
    item.threshold = parseNonNegativeNumber(req.body.threshold, 'Threshold', {
      required: true,
    });
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'supplierId')) {
    const supplierId = parseSupplierId(req.body.supplierId);
    if (supplierId) {
      const supplier = await User.findById(supplierId).select('_id');
      if (!supplier) {
        throw new ApiError(404, 'Supplier user not found');
      }
      item.supplierId = supplierId;
    } else {
      item.supplierId = undefined;
    }
  }

  await item.save();
  const populated = await Inventory.findById(item._id).populate(
    'supplierId',
    'name email'
  );

  return res.status(200).json({
    success: true,
    message: 'Inventory stock updated successfully',
    data: populated,
  });
});

export const getItems = asyncHandler(async (req, res) => {
  const query = {};

  if (typeof req.query?.search === 'string' && req.query.search.trim()) {
    query.itemName = { $regex: req.query.search.trim(), $options: 'i' };
  }

  if (req.query?.lowStock === 'true') {
    query.isLowStock = true;
  } else if (req.query?.lowStock === 'false') {
    query.isLowStock = false;
  }

  const items = await Inventory.find(query)
    .populate('supplierId', 'name email')
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: items,
  });
});

export const getInventorySummary = asyncHandler(async (req, res) => {
  const [totalItems, lowStockCount, quantityRows] = await Promise.all([
    Inventory.countDocuments(),
    Inventory.countDocuments({ isLowStock: true }),
    Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
        },
      },
    ]),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      totalItems,
      lowStockCount,
      totalQuantity: quantityRows[0]?.totalQuantity ?? 0,
    },
  });
});
