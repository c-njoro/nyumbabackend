const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  pictures: [
    {
      type: String,
    },
  ],

  landlordId: {
    type: mongoose.Schema.Types.ObjectId || null,
    ref: "Landlord",
    required: true,
  },
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
  ],

  timestamps: true,
});

const Property = mongoose.model("Property", propertySchema);
module.exports = Property;
