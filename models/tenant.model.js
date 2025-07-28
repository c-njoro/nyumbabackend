const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    propertyRented: {
      type: mongoose.Schema.Types.ObjectId || null,
      ref: "Property",
    },

    roomRented: {
      type: mongoose.Schema.Types.ObjectId || null,
      ref: "Room",
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

const Tenant = mongoose.model("Tenant", tenantSchema);
module.exports = Tenant;
