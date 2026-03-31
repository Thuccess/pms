const Property = require("../models/Property");
const Unit = require("../models/Unit");
const Tenant = require("../models/Tenant");
const Payment = require("../models/Payment");
const MaintenanceRequest = require("../models/MaintenanceRequest");
const asyncHandler = require("../utils/asyncHandler");
const { toCsv } = require("../utils/csv");

const datasets = {
  properties: {
    model: Property,
    headers: [
      "id",
      "name",
      "location",
      "type",
      "price",
      "image",
      "images",
      "status",
      "units",
      "occupancy",
      "revenue",
      "description",
      "amenities",
    ],
    map: (doc) => ({
      id: String(doc._id),
      name: doc.name,
      location: doc.location,
      type: doc.type,
      price: doc.price,
      image: doc.image,
      images: Array.isArray(doc.images) ? doc.images.join("; ") : "",
      status: doc.status,
      units: doc.units,
      occupancy: doc.occupancy,
      revenue: doc.revenue,
      description: doc.description,
      amenities: Array.isArray(doc.amenities) ? doc.amenities.join("; ") : "",
    }),
  },
  units: {
    model: Unit,
    headers: ["id", "propertyId", "number", "type", "rent", "status", "tenantId"],
    map: (doc) => ({
      id: String(doc._id),
      propertyId: doc.propertyId ? String(doc.propertyId) : "",
      number: doc.number,
      type: doc.type,
      rent: doc.rent,
      status: doc.status,
      tenantId: doc.tenantId ? String(doc.tenantId) : "",
    }),
  },
  tenants: {
    model: Tenant,
    headers: [
      "id",
      "name",
      "email",
      "phone",
      "avatar",
      "propertyId",
      "unitId",
      "leaseStart",
      "leaseEnd",
      "balance",
      "status",
    ],
    map: (doc) => ({
      id: String(doc._id),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      avatar: doc.avatar,
      propertyId: doc.propertyId ? String(doc.propertyId) : "",
      unitId: doc.unitId ? String(doc.unitId) : "",
      leaseStart: doc.leaseStart,
      leaseEnd: doc.leaseEnd,
      balance: doc.balance,
      status: doc.status || "",
    }),
  },
  payments: {
    model: Payment,
    headers: [
      "id",
      "tenantId",
      "propertyId",
      "amount",
      "date",
      "status",
      "method",
      "description",
    ],
    map: (doc) => ({
      id: String(doc._id),
      tenantId: doc.tenantId ? String(doc.tenantId) : "",
      propertyId: doc.propertyId ? String(doc.propertyId) : "",
      amount: doc.amount,
      date: doc.date,
      status: doc.status,
      method: doc.method,
      description: doc.description,
    }),
  },
  maintenance: {
    model: MaintenanceRequest,
    headers: [
      "id",
      "propertyId",
      "unitId",
      "issue",
      "priority",
      "status",
      "date",
      "vendor",
      "description",
    ],
    map: (doc) => ({
      id: String(doc._id),
      propertyId: doc.propertyId ? String(doc.propertyId) : "",
      unitId: doc.unitId ? String(doc.unitId) : "",
      issue: doc.issue,
      priority: doc.priority,
      status: doc.status,
      date: doc.date,
      vendor: doc.vendor || "",
      description: doc.description,
    }),
  },
};

const exportCsv = asyncHandler(async (req, res) => {
  const key = (req.params.resource || "").toLowerCase();
  const dataset = datasets[key];
  if (!dataset) {
    return res.status(404).json({ message: "Dataset not found" });
  }

  const docs = await dataset.model.find().sort({ createdAt: -1 });
  const rows = docs.map(dataset.map);
  const csv = toCsv(rows, dataset.headers);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${key}.csv"`);
  return res.status(200).send(csv);
});

module.exports = { exportCsv };
