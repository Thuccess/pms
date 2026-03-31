const mongoose = require("mongoose");

const maintenanceRequestSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    issue: { type: String, required: true },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      required: true,
      default: "Open",
    },
    date: { type: String, required: true },
    vendor: { type: String, default: "" },
    description: { type: String, required: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaintenanceRequest", maintenanceRequestSchema);
