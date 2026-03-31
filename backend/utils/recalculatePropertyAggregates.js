const mongoose = require("mongoose");
const Property = require("../models/Property");
const Unit = require("../models/Unit");
const Payment = require("../models/Payment");

const toObjectId = (id) => (id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id));

const recalculatePropertyAggregates = async (propertyId) => {
  if (!propertyId) return;
  const propertyObjectId = toObjectId(propertyId);

  const units = await Unit.find({ propertyId: propertyObjectId });
  const totalUnits = units.length;
  const occupiedUnits = units.filter((unit) => unit.status === "Occupied").length;
  const occupancy = totalUnits ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  const payments = await Payment.find({ propertyId: propertyObjectId });
  const revenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  await Property.findByIdAndUpdate(propertyObjectId, {
    units: totalUnits,
    occupancy,
    revenue,
  });
};

module.exports = recalculatePropertyAggregates;
