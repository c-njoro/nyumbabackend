const express = require("express");
const propertyRouter = express.Router();

const {
  createPropertyAndAddToLandlord,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,

  getRoomsOfProperty,
} = require("../controllers/property.controller");

// Property routes
propertyRouter.post("/create", createPropertyAndAddToLandlord);
propertyRouter.get("/", getAllProperties);
propertyRouter.get("/get-one/:propertyId", getPropertyById);
propertyRouter.put("/update/:propertyId", updateProperty);
propertyRouter.delete("/delete/:propertyId", deleteProperty);
propertyRouter.get("/:propertyId/rooms", getRoomsOfProperty);

module.exports = propertyRouter;
