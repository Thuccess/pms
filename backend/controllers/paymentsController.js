const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Tenant = require("../models/Tenant");
const Unit = require("../models/Unit");
const asyncHandler = require("../utils/asyncHandler");
const recalculatePropertyAggregates = require("../utils/recalculatePropertyAggregates");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const inferPropertyId = async (tenantId) => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) return null;
  const unit = await Unit.findById(tenant.unitId);
  return unit?.propertyId || tenant.propertyId;
};

const getAll = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.tenantId && isValidId(req.query.tenantId)) query.tenantId = req.query.tenantId;
  if (req.query.propertyId && isValidId(req.query.propertyId)) query.propertyId = req.query.propertyId;
  if (req.query.status) query.status = req.query.status;
  const items = await Payment.find(query).sort({ createdAt: -1 });
  res.json(items);
});

const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

  const item = await Payment.findById(id);
  if (!item) return res.status(404).json({ message: "Payment not found" });
  res.json(item);
});

const create = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (!payload.propertyId && payload.tenantId) {
    payload.propertyId = await inferPropertyId(payload.tenantId);
  }
  if (!payload.propertyId) {
    return res.status(400).json({ message: "propertyId could not be derived" });
  }

  const item = await Payment.create(payload);
  await recalculatePropertyAggregates(item.propertyId);
  res.status(201).json(item);
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

  const existing = await Payment.findById(id);
  if (!existing) return res.status(404).json({ message: "Payment not found" });

  const payload = { ...req.body };
  if (!payload.propertyId && payload.tenantId) {
    payload.propertyId = await inferPropertyId(payload.tenantId);
  }

  const item = await Payment.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  await recalculatePropertyAggregates(existing.propertyId);
  if (String(existing.propertyId) !== String(item.propertyId)) {
    await recalculatePropertyAggregates(item.propertyId);
  }
  res.json(item);
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

  const payment = await Payment.findById(id);
  if (!payment) return res.status(404).json({ message: "Payment not found" });

  await Payment.deleteOne({ _id: payment._id });
  await recalculatePropertyAggregates(payment.propertyId);
  res.json({ message: "Payment deleted" });
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
