const Property = require("../models/Property");
const Unit = require("../models/Unit");
const Tenant = require("../models/Tenant");
const Payment = require("../models/Payment");
const MaintenanceRequest = require("../models/MaintenanceRequest");
const asyncHandler = require("../utils/asyncHandler");

const withId = (doc) => ({
  ...doc.toObject(),
  id: String(doc._id),
});

const getRecords = asyncHandler(async (_req, res) => {
  const [properties, units, tenants, payments, maintenance] = await Promise.all([
    Property.find().sort({ createdAt: -1 }),
    Unit.find().sort({ createdAt: -1 }),
    Tenant.find().sort({ createdAt: -1 }),
    Payment.find().sort({ createdAt: -1 }),
    MaintenanceRequest.find().sort({ createdAt: -1 }),
  ]);

  return res.json({
    properties: properties.map(withId),
    units: units.map(withId),
    tenants: tenants.map(withId),
    payments: payments.map(withId),
    maintenance: maintenance.map(withId),
  });
});

module.exports = { getRecords };
