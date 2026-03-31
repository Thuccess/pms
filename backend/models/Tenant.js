const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    avatar: { type: String, required: true },
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
    leaseStart: { type: String, required: true },
    leaseEnd: { type: String, required: true },
    balance: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tenant", tenantSchema);
