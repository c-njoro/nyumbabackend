const Room = require("../models/room.model");
const Property = require("../models/property.model");
const Tenant = require("../models/tenant.model");
const Landlord = require("../models/landlord.model");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//create a tenant without a room
exports.createTenantWithNoRoom = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    if (!name || !email || !phoneNumber || !password) {
      return res.status(400).json({
        message: "All fields are required to create a tenant",
      });
    }

    // Create a new tenant
    const newTenant = new Tenant({
      name,
      email,
      phoneNumber,
      password,
      roomRented: null, // No room rented initially
      propertyRented: null, // No property rented initially
    });

    // Save the tenant to the database
    const savedTenant = await newTenant.save();

    res.status(201).json({
      message: "Tenant created successfully",
      tenant: savedTenant,
    });
  } catch (error) {
    console.error("Error creating tenant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a tenant with a room
exports.createTenantWithRoom = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, roomRented, propertyRented } =
      req.body;

    if (
      (!name || !email || !phoneNumber || !password || !roomRented,
      !propertyRented)
    ) {
      return res.status(400).json({
        message: "All fields are required to create a tenant",
      });
    }

    //check if tenant already exists
    const existingTenant = await Tenant.findOne({ email });
    if (existingTenant) {
      return res.status(400).json({ message: "Tenant already exists" });
    }

    // Check if the room exists
    const room = await Room.findById(roomRented);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const property = await Property.findById(propertyRented);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (room.property.toString() !== property._id.toString()) {
      return res
        .status(400)
        .json({ message: "Room does not belong to the specified property" });
    }

    if (room.status !== "available") {
      return res
        .status(400)
        .json({ message: "Room is not available for rent" });
    }

    // Create a new tenant
    const newTenant = new Tenant({
      name,
      email,
      phoneNumber,
      password,
      roomRented, // Assign the rented room
      propertyRented, // Assign the property from the room
    });

    // Save the tenant to the database
    const savedTenant = await newTenant.save();

    // Update the room status to 'rented'
    room.status = "rented";
    room.tenant = savedTenant._id; // Associate the tenant with the room

    await room.save();
    res.status(201).json({
      message: "Tenant created successfully",
      tenant: savedTenant,
    });
  } catch (error) {
    console.error("Error creating tenant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all tenants
exports.getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find()
      .populate("roomRented", "name price status")
      .populate("propertyRented", "name location");

    res.status(200).json(tenants);
  } catch (error) {
    console.error("Error fetching tenants:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a tenant by ID
exports.getTenantById = async (req, res) => {
  try {
    const tenantId = req.params.id;
    const tenant = await Tenant.findById(tenantId)
      .populate("roomRented", "name price status")
      .populate("propertyRented", "name location");

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.status(200).json(tenant);
  } catch (error) {
    console.error("Error fetching tenant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a tenant
exports.updateTenant = async (req, res) => {
  try {
    const tenantId = req.params.id;
    const { name, email, phoneNumber, password, roomRented, propertyRented } =
      req.body;

    // Find the tenant by ID
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Update tenant details
    tenant.name = name || tenant.name;
    tenant.email = email || tenant.email;
    tenant.phoneNumber = phoneNumber || tenant.phoneNumber;
    tenant.password = password || tenant.password;
    tenant.roomRented = roomRented || tenant.roomRented;
    tenant.propertyRented = propertyRented || tenant.propertyRented;

    // Save the updated tenant
    const updatedTenant = await tenant.save();

    res.status(200).json({
      message: "Tenant updated successfully",
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error("Error updating tenant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a tenant
exports.deleteTenant = async (req, res) => {
  try {
    const tenantId = req.params.id;

    // Find the tenant by ID
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }
    // Remove the tenant from the database
    await Tenant.findByIdAndDelete(tenantId);
    // If the tenant had a room, update the room status to 'available'
    if (tenant.roomRented) {
      const room = await Room.findById(tenant.roomRented);
      if (room) {
        room.status = "available";
        room.tenant = null; // Clear the tenant association
        await room.save();
      }
    }
    res.status(200).json({ message: "Tenant deleted successfully" });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.tenantLogin = async (req, res) => {
  try {
    //login
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find the landlord by email
    const tenant = await Tenant.findOne({ email });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Check if the password is correct without bcrypt

    if (password != tenant.password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: tenant._id, email: tenant.email },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );
    res.status(200).json({
      token,
      tenant: {
        id: tenant._id,
        name: tenant.name,
        email: tenant.email,
        phoneNumber: tenant.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Error during tenant login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
