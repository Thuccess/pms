const mongoose = require("mongoose");
const Property = require("../models/Property");
const Unit = require("../models/Unit");
const Tenant = require("../models/Tenant");
const Payment = require("../models/Payment");
const MaintenanceRequest = require("../models/MaintenanceRequest");
const asyncHandler = require("../utils/asyncHandler");
const recalculatePropertyAggregates = require("../utils/recalculatePropertyAggregates");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const normalizePropertyPayload = (payload = {}, { ensureImages = false } = {}) => {
  const next = { ...payload };
  const hasImagesField = Object.prototype.hasOwnProperty.call(next, "images");
  const hasImageField = Object.prototype.hasOwnProperty.call(next, "image");
  const images = Array.isArray(next.images)
    ? next.images.filter((item) => typeof item === "string" && item.trim().length > 0)
    : [];

  if ((!next.image || String(next.image).trim().length === 0) && images.length > 0) {
    next.image = images[0];
  }
  if (hasImagesField || hasImageField || ensureImages) {
    next.images = images.length > 0 ? images : next.image ? [next.image] : [];
  }
  return next;
};

const getAll = asyncHandler(async (req, res) => {
  const items = await Property.find().sort({ createdAt: -1 });
  res.json(items);
});

const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

  const item = await Property.findById(id);
  if (!item) return res.status(404).json({ message: "Property not found" });
  res.json(item);
});

const create = asyncHandler(async (req, res) => {
  const item = await Property.create(normalizePropertyPayload(req.body, { ensureImages: true }));
  await recalculatePropertyAggregates(item._id);
  res.status(201).json(item);
});

const update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

  const item = await Property.findByIdAndUpdate(id, normalizePropertyPayload(req.body), {
    new: true,
    runValidators: true,
  });
  if (!item) return res.status(404).json({ message: "Property not found" });
  await recalculatePropertyAggregates(item._id);
  res.json(item);
});

const remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid ID" });

  const property = await Property.findById(id);
  if (!property) return res.status(404).json({ message: "Property not found" });

  await Unit.deleteMany({ propertyId: property._id });
  await Tenant.deleteMany({ propertyId: property._id });
  await Payment.deleteMany({ propertyId: property._id });
  await MaintenanceRequest.deleteMany({ propertyId: property._id });
  await Property.deleteOne({ _id: property._id });

  res.json({ message: "Property deleted" });
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
