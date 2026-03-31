const mongoose = require("mongoose");
const Tenant = require("../models/Tenant");
const Unit = require("../models/Unit");
const Payment = require("../models/Payment");
const asyncHandler = require("../utils/asyncHandler");
const recalculatePropertyAggregates = require("../utils/recalculatePropertyAggregates");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const setUnitOccupied = async (unitId, tenantId) => {
  await Unit.findByIdAndUpdate(unitId, {
    tenantId,
    status: "Occupied",
  });
};

const setUnitVacant = async (unitId) => {
  await Unit.findByIdAndUpdate(unitId, {
    tenantId: null,
    status: "Vacant",
  });
};

const getAll = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.propertyId && isValidId(req.query.propertyId)) query.propertyId = req.query.propertyId;
  if (req.query.unitId && isValidId(req.query.unitId)) query.unitId = req.query.unitId;
  const items = await Tenant.find(query).sort({ createdAt: -1 });
  res.json(items);
});

const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

  const item = await Tenant.findById(id);
  if (!item) return res.status(404).json({ message: "Tenant not found" });
  res.json(item);
});

const create = asyncHandler(async (req, res) => {
  const unit = await Unit.findById(req.body.unitId);
  if (!unit) return res.status(400).json({ message: "Invalid unitId" });

  const propertyId = req.body.propertyId || unit.propertyId;
  const item = await Tenant.create({ ...req.body, propertyId });
  await setUnitOccupied(unit._id, item._id);
  await recalculatePropertyAggregates(propertyId);
  res.status(201).json(item);
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

  const existing = await Tenant.findById(id);
  if (!existing) return res.status(404).json({ message: "Tenant not found" });

  const nextUnitId = req.body.unitId || existing.unitId;
  const nextUnit = await Unit.findById(nextUnitId);
  if (!nextUnit) return res.status(400).json({ message: "Invalid unitId" });

  const nextPropertyId = req.body.propertyId || nextUnit.propertyId || existing.propertyId;

  const item = await Tenant.findByIdAndUpdate(
    id,
    { ...req.body, propertyId: nextPropertyId, unitId: nextUnitId },
    { new: true, runValidators: true }
  );

  if (String(existing.unitId) !== String(nextUnitId)) {
    await setUnitVacant(existing.unitId);
  }
  await setUnitOccupied(nextUnitId, item._id);

  await recalculatePropertyAggregates(existing.propertyId);
  if (String(existing.propertyId) !== String(nextPropertyId)) {
    await recalculatePropertyAggregates(nextPropertyId);
  }

  res.json(item);
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

  const tenant = await Tenant.findById(id);
  if (!tenant) return res.status(404).json({ message: "Tenant not found" });

  await Payment.deleteMany({ tenantId: tenant._id });
  await Tenant.deleteOne({ _id: tenant._id });
  await setUnitVacant(tenant.unitId);
  await recalculatePropertyAggregates(tenant.propertyId);

  res.json({ message: "Tenant deleted" });
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
