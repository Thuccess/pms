const mongoose = require("mongoose");
const Unit = require("../models/Unit");
const Tenant = require("../models/Tenant");
const Payment = require("../models/Payment");
const MaintenanceRequest = require("../models/MaintenanceRequest");
const asyncHandler = require("../utils/asyncHandler");
const recalculatePropertyAggregates = require("../utils/recalculatePropertyAggregates");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getAll = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.propertyId && isValidId(req.query.propertyId)) {
    query.propertyId = req.query.propertyId;
  }
  const items = await Unit.find(query).sort({ createdAt: -1 });
  res.json(items);
});

const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

  const item = await Unit.findById(id);
  if (!item) return res.status(404).json({ message: "Unit not found" });
  res.json(item);
});

const create = asyncHandler(async (req, res) => {
  const item = await Unit.create(req.body);
  await recalculatePropertyAggregates(item.propertyId);
  res.status(201).json(item);
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

  const existing = await Unit.findById(id);
  if (!existing) return res.status(404).json({ message: "Unit not found" });

  const item = await Unit.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  await recalculatePropertyAggregates(existing.propertyId);
  if (String(existing.propertyId) !== String(item.propertyId)) {
    await recalculatePropertyAggregates(item.propertyId);
  }

  res.json(item);
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

  const unit = await Unit.findById(id);
  if (!unit) return res.status(404).json({ message: "Unit not found" });

  const tenants = await Tenant.find({ unitId: unit._id });
  const tenantIds = tenants.map((tenant) => tenant._id);

  await Tenant.deleteMany({ unitId: unit._id });
  if (tenantIds.length) {
    await Payment.deleteMany({ tenantId: { $in: tenantIds } });
  }
  await MaintenanceRequest.deleteMany({ unitId: unit._id });
  await Unit.deleteOne({ _id: unit._id });

  await recalculatePropertyAggregates(unit.propertyId);
  res.json({ message: "Unit deleted" });
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
