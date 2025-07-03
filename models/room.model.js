const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["single", "bedSitter", "oneBedroom", "twoBedroom", "threeBedroom"],
    required: true,
  },
  rentingPrice: {
    type: Number,
    required: true,
  },
  pictures: [
    {
      type: String,
    },
  ],
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId || null,
    ref: "Tenant",
  },
  status: {
    type: String,
    enum: ["available", "rented"],
    default: "available",
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Landlord",
    required: true,
  },
});

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
