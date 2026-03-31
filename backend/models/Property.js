const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["Active", "Under Maintenance", "Sold"],
      required: true,
      default: "Active",
    },
    units: { type: Number, required: true, default: 0 },
    occupancy: { type: Number, required: true, default: 0 },
    revenue: { type: Number, required: true, default: 0 },
    description: { type: String, required: true, default: "" },
    amenities: { type: [String], required: true, default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
