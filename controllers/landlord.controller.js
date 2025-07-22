const Room = require("../models/room.model");
const Property = require("../models/property.model");
const Tenant = require("../models/tenant.model");
const Landlord = require("../models/landlord.model");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Create a new landlord
exports.createLandlord = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    if (!name || !email || !phoneNumber || !password) {
      return res.status(400).json({
        message: "All fields are required to create a landlord",
      });
    }

    // Create a new landlord
    const newLandlord = new Landlord({
      name,
      email,
      phoneNumber,
      password,
      properties: [],
    });

    // Save the landlord to the database
    const savedLandlord = await newLandlord.save();

    res.status(201).json({
      landlord: savedLandlord,
    });
  } catch (error) {
    console.error("Error creating landlord:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// add a property to the landlord
exports.addPropertyToLandlord = async (req, res) => {
  try {
    const { landlordId, propertyId } = req.body;

    if (!landlordId || !propertyId) {
      return res.status(400).json({
        message: "Landlord ID and Property ID are required",
      });
    }

    // Find the landlord and property
    const landlord = await Landlord.findById(landlordId);
    const property = await Property.findById(propertyId);

    if (!landlord) {
      return res.status(404).json({
        message: "Landlord not found",
      });
    }
    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    if (landlord.properties.includes(property._id)) {
      return res.status(400).json({
        message: "Property already added to this landlord",
      });
    }

    if (
      property.landlordId &&
      property.landlordId.toString() !== landlord._id.toString()
    ) {
      return res.status(400).json({
        message: "Property is already assigned to another landlord",
      });
    }

    // Add the property to the landlord's properties array
    landlord.properties.push(property._id);
    await landlord.save();

    res.status(200).json({
      message: "Property added to landlord successfully",
      landlord,
    });
  } catch (error) {
    console.error("Error adding property to landlord:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get all landlords
exports.getAllLandlords = async (req, res) => {
  try {
    const landlords = await Landlord.find().populate("properties");

    res.status(200).json({
      landlords,
    });
  } catch (error) {
    console.error("Error retrieving landlords:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a landlord by ID
exports.getLandlordById = async (req, res) => {
  try {
    const { id } = req.params;

    const landlord = await Landlord.findById(id).populate("properties");

    if (!landlord) {
      return res.status(404).json({
        message: "Landlord not found",
      });
    }

    res.status(200).json({
      message: "Landlord retrieved successfully",
      landlord,
    });
  } catch (error) {
    console.error("Error retrieving landlord:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a landlord's details
exports.updateLandlord = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber } = req.body;

    if (!name || !email || !phoneNumber) {
      return res.status(400).json({
        message: "All fields are required to update a landlord",
      });
    }

    const updatedLandlord = await Landlord.findByIdAndUpdate(
      id,
      { name, email, phoneNumber },
      { new: true }
    );

    if (!updatedLandlord) {
      return res.status(404).json({
        message: "Landlord not found",
      });
    }

    res.status(200).json({
      message: "Landlord updated successfully",
      landlord: updatedLandlord,
    });
  } catch (error) {
    console.error("Error updating landlord:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//remove a property from the landlord
exports.removePropertyFromLandlord = async (req, res) => {
  try {
    const { landlordId, propertyId } = req.body;

    if (!landlordId || !propertyId) {
      return res.status(400).json({
        message: "Landlord ID and Property ID are required",
      });
    }

    // Find the landlord and property
    const landlord = await Landlord.findById(landlordId);

    if (!landlord) {
      return res.status(404).json({
        message: "Landlord not found",
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Check if the property exists in the landlord's properties
    if (
      !landlord.properties.includes(propertyId) ||
      !property.landlordId ||
      property.landlordId.toString() !== landlord._id.toString()
    ) {
      return res.status(404).json({
        message: "Property not found in this landlord's properties",
      });
    }

    // Remove the property from the landlord's properties array
    landlord.properties.pull(propertyId);
    // Also remove the landlordId from the property
    property.landlordId = null;
    await property.save();
    await landlord.save();

    res.status(200).json({
      message: "Property removed from landlord successfully",
      landlord,
    });
  } catch (error) {
    console.error("Error removing property from landlord:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//delete a landlord
exports.deleteLandlord = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLandlord = await Landlord.findByIdAndDelete(id);

    if (!deletedLandlord) {
      return res.status(404).json({
        message: "Landlord not found",
      });
    }

    // Optionally, you can also remove the landlord's properties or tenants
    await Property.updateMany(
      { landlordId: id },
      { $unset: { landlordId: "" } }
    );
    await Tenant.deleteMany({ landlordId: id });

    res.status(200).json({
      message: "Landlord deleted successfully",
      landlord: deletedLandlord,
    });
  } catch (error) {
    console.error("Error deleting landlord:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get all properties of a landlord
exports.getPropertiesOfLandlord = async (req, res) => {
  try {
    const { landlordId } = req.params;

    if (!landlordId) {
      return res.status(400).json({
        message: "Landlord ID is required",
      });
    }

    const landlord = await Landlord.findById(landlordId).populate("properties");

    if (!landlord) {
      return res.status(404).json({
        message: "Landlord not found",
      });
    }

    res.status(200).json({
      properties: landlord.properties,
    });
  } catch (error) {
    console.error("Error retrieving properties of landlord:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//login as landlord

exports.landlordLogin = async (req, res) => {
  try {
    //login
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find the landlord by email
    const landlord = await Landlord.findOne({ email });
    if (!landlord) {
      return res.status(404).json({ message: "Landlord not found" });
    }

    // Check if the password is correct without bcrypt

    if (password != landlord.password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: landlord._id, email: landlord.email },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );
    res.status(200).json({
      token,
      landlord: {
        id: landlord._id,
        name: landlord.name,
        email: landlord.email,
        phoneNumber: landlord.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Error during landlord login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
