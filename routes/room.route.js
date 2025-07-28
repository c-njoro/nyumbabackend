const express = require("express");
const roomRouter = express.Router();

const {
  createRoom,
  updateRoomAvailability,
  updateRoomRentingPrice,
  getAllRooms,
  deleteRoom,
  getRoomById,
  rentRoom,
  makeRoomAvailable,
} = require("../controllers/room.controller");

roomRouter.post("/create", createRoom);
roomRouter.put("/update-availability/:roomId", updateRoomAvailability);
roomRouter.put("/update-renting-price/:roomId", updateRoomRentingPrice);
roomRouter.get("/", getAllRooms);
roomRouter.get("/get-one/:roomId", getRoomById);
roomRouter.delete("/delete/:roomId", deleteRoom);
roomRouter.post("/rent/:roomId", rentRoom);
roomRouter.put("/make-available/:roomId", makeRoomAvailable);

module.exports = roomRouter;
