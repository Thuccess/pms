const mongoose = require("mongoose");
const MaintenanceRequest = require("../models/MaintenanceRequest");
const Unit = require("../models/Unit");
const asyncHandler = require("../utils/asyncHandler");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const inferPropertyId = async (unitId) => {
  const unit = await Unit.findById(unitId);
  return unit?.propertyId || null;
};

const getAll = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.propertyId && isValidId(req.query.propertyId)) query.propertyId = req.query.propertyId;
  if (req.query.unitId && isValidId(req.query.unitId)) query.unitId = req.query.unitId;
  if (req.query.status) query.status = req.query.status;
  const items = await MaintenanceRequest.find(query).sort({ createdAt: -1 });
  res.json(items);
});

const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

  const item = await MaintenanceRequest.findById(id);
  if (!item) return res.status(404).json({ message: "Maintenance request not found" });
  res.json(item);
});

const create = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (!payload.propertyId && payload.unitId) {
    payload.propertyId = await inferPropertyId(payload.unitId);
  }
  if (!payload.propertyId) {
    return res.status(400).json({ message: "propertyId could not be derived" });
  }
  const item = await MaintenanceRequest.create(payload);
  res.status(201).json(item);
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

  const existing = await MaintenanceRequest.findById(id);
  if (!existing) return res.status(404).json({ message: "Maintenance request not found" });

  const payload = { ...req.body };
  if (!payload.propertyId && payload.unitId) {
    payload.propertyId = await inferPropertyId(payload.unitId);
  }

  const item = await MaintenanceRequest.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  res.json(item);
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

  const existing = await MaintenanceRequest.findById(id);
  if (!existing) return res.status(404).json({ message: "Maintenance request not found" });

  await MaintenanceRequest.deleteOne({ _id: existing._id });
  res.json({ message: "Maintenance request deleted" });
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
