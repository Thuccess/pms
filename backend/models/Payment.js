const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Late"],
      required: true,
    },
    method: { type: String, required: true },
    description: { type: String, required: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
