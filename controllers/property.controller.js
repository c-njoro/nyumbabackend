const Room = require("../models/room.model");
const Property = require("../models/property.model");
const Tenant = require("../models/tenant.model");
const Landlord = require("../models/landlord.model");

// create a property and add to landlord
exports.createPropertyAndAddToLandlord = async (req, res) => {
  try {
    const { name, address, description, landlordId } = req.body;

    if ((!name, !address, !description, !landlordId)) {
      return res
        .status(400)
        .json({ message: "A required variable is missing!!" });
    }

    //verify landlord id
    const landlord = Landlord.findById(landlordId);
    if (!landlord) {
      return res.status(404).json({
        message: "The landlord passed is not valid, no such landlord",
      });
    }

    const newProperty = new Property({
      name,
      address,
      description,
      landlordId,
      pictures: [],
      rooms: [],
    });

    const savedProperty = await newProperty.save();

    // Add the property to the landlord's properties array
    await Landlord.findByIdAndUpdate(
      landlordId,
      { $push: { properties: savedProperty._id } },
      { new: true }
    );

    res.status(201).json(savedProperty);
  } catch (error) {
    console.log("Error creating property:", error);
    return res.status(500).json({
      message:
        "Internal server error: Could not create property and add to landlord.",
    });
  }
};

// Get all properties
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate("landlordId", "name email")
      .populate("rooms");

    if (properties.length === 0) {
      return res.status(404).json({ message: "No properties found" });
    }

    res.status(200).json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get property by id
exports.getPropertyById = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    const property = await Property.findById(propertyId)
    .populate("rooms");

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a property
exports.updateProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { name, address, description } = req.body;

    if (!propertyId || !name || !address || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const property = await Property.findByIdAndUpdate(
      propertyId,
      { name, address, description },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a property
exports.deleteProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    const property = await Property.findByIdAndDelete(propertyId);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Optionally, remove the property reference from the landlord
    await Landlord.updateMany(
      { properties: propertyId },
      { $pull: { properties: propertyId } }
    );

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get all rooms of a property
exports.getRoomsOfProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // Find the property by ID
    const property = await Property.findById(propertyId).populate("rooms");

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if the property has rooms
    if (property.rooms.length === 0) {
      return res
        .status(404)
        .json({ message: "No rooms found for this property" });
    }

    // Return the rooms of the property
    res.status(200).json({
      rooms: property.rooms,
    });
  } catch (error) {
    console.error("Error fetching rooms of property:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
