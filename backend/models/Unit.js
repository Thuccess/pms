const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    number: { type: String, required: true },
    type: { type: String, required: true },
    rent: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Occupied", "Vacant", "Maintenance"],
      required: true,
      default: "Vacant",
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Unit", unitSchema);
