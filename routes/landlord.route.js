const express = require("express");
const landlordRouter = express.Router();

const {
  createLandlord,
  addPropertyToLandlord,
  getLandlordById,
  getAllLandlords,
  updateLandlord,
  deleteLandlord,
  removePropertyFromLandlord,
  getPropertiesOfLandlord,
  landlordLogin,
} = require("../controllers/landlord.controller");

//landlord routes
landlordRouter.post("/create", createLandlord);
landlordRouter.post("/add-property/:landlordId", addPropertyToLandlord);
landlordRouter.get("/get-one/:landlordId", getLandlordById);
landlordRouter.get("/", getAllLandlords);
landlordRouter.put("/update/:landlordId", updateLandlord);
landlordRouter.delete("/delete/:landlordId", deleteLandlord);
landlordRouter.delete(
  "/remove-property/:landlordId/:propertyId",
  removePropertyFromLandlord
);
landlordRouter.get(
  "/get-landlord-properties/:landlordId",
  getPropertiesOfLandlord
);
landlordRouter.post("/login", landlordLogin);

module.exports = landlordRouter;
