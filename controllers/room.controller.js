const Room = require("../models/room.model");
const Property = require("../models/property.model");
const Tenant = require("../models/tenant.model");

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { name, rentingPrice, property, landlord, type } = req.body;

    if (!name || !type || !rentingPrice || !property || !landlord) {
      return res.status(400).json({
        message:
          "All fields are required: information missing to create a room",
      });
    }

    // Check if the property exists
    const existingProperty = await Property.findById(property);
    if (!existingProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if the landlord exists
    const existingLandlord = await Tenant.findById(landlord);
    if (!existingLandlord) {
      return res.status(404).json({ message: "Landlord not found" });
    }

    // Create a new room
    const newRoom = new Room({
      name,
      type,
      rentingPrice,
      property,
      landlord,
    });

    // Save the room to the database
    const savedRoom = await newRoom.save();

    // Update the property with the new room
    existingProperty.rooms.push(savedRoom._id);
    await existingProperty.save();
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
