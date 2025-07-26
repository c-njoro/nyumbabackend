const Room = require("../models/room.model");
const Property = require("../models/property.model");
const Tenant = require("../models/tenant.model");
const Landlord = require("../models/landlord.model");

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
    const existingLandlord = await Landlord.findById(landlord);
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

    res.status(201).json({ room: savedRoom });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

//update room
exports.updateRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { status } = req.body;

    // Validate input
    if (!roomId || !status) {
      return res.status(400).json({
        message: "Room ID and at status field to update are required",
      });
    }
    // Find the room by ID
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (status) {
      if (status === "available") {
        //find the tenant who rented this room and set their roomRented to null
        const tenant = await Tenant.findOne({ roomRented: room._id });
        if (tenant) {
          room.status = "available";
          room.tenant = null;
          tenant.roomRented = null;
          await tenant.save();
          await room.save();
          return res
            .status(200)
            .json({ message: "Room updated successfully", room });
        } else {
          return res.status(404).json({
            message: "Tenant not found, room is already available.",
          });
        }
      }

      if (status === "rented") {
        //make the room  tenant a tenant whose roomRented === room._id
        const tenant = await Tenant.findOne({ roomRented: room._id });
        if (tenant) {
          room.tenant = tenant._id;
          room.status = "rented";
          tenant.roomRented = room._id;
          await tenant.save();
          await room.save();
          return res
            .status(200)
            .json({ message: "Room updated successfully", room });
        } else {
          return res.status(404).json({
            message:
              "Tenant not found, first create tenant account to update room status.",
          });
        }
      }
    }
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//update renting price of a room
exports.updateRoomRentingPrice = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { rentingPrice } = req.body;
    // Validate input
    if (!roomId || !rentingPrice) {
      return res.status(400).json({
        message: "Room ID and renting price are required to update the room",
      });
    }

    // Find the room by ID
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if the renting price is a valid number
    if (typeof rentingPrice !== "number" || rentingPrice <= 0) {
      return res.status(400).json({
        message: "Renting price must be a positive number",
      });
    }

    // Update the renting price
    room.rentingPrice = rentingPrice;
    await room.save();
    return res.status(200).json({
      message: "Room renting price updated successfully",
      room,
    });
  } catch (error) {
    console.error("Error updating room renting price:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const { propertyId } = req.query;

    if (propertyId) {
      // Fetch rooms for a specific property
      const propertySearched = await Property.findById(propertyId);
      if (!propertySearched) {
        return res
          .status(404)
          .json({ message: "The property does not exist or is deleted!!" });
      }
      const rooms = await Room.find({ property: propertyId });
      return res.status(200).json({ rooms });
    }

    // Fetch all rooms
    const rooms = await Room.find();
    return res.status(200).json({ rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// delete a room
exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Validate input
    if (!roomId) {
      return res.status(400).json({ message: "Room ID is required to delete" });
    }

    // Find the room by ID
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if the room is rented
    if (room.status === "rented") {
      return res.status(400).json({
        message: "Cannot delete a rented room. Please update its status first.",
      });
    }

    //remove the room from its property
    const property = await Property.findById(room.property);
    if (property) {
      property.rooms = property.rooms.filter(
        (roomId) => roomId.toString() !== room._id.toString()
      );
      await property.save();
    }

    // Delete the room
    await Room.findByIdAndDelete(roomId);
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a room by ID
exports.getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Validate input
    if (!roomId) {
      return res.status(400).json({ message: "Room ID is required" });
    }

    // Find the room by ID
    const room = await Room.findById(roomId)
      .populate("property")
      .populate("landlord")
      .populate("tenant");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.status(200).json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
