const express = require("express");
const roomRouter = express.Router();

const {
  createRoom,
  updateRoomAvailability,
  updateRoomRentingPrice,
  getAllRooms,
  deleteRoom,
  getRoomById,
} = require("../controllers/room.controller");

roomRouter.post("/create", createRoom);
roomRouter.put("/update-availability/:roomId", updateRoomAvailability);
roomRouter.put("/update-renting-price/:roomId", updateRoomRentingPrice);
roomRouter.get("/", getAllRooms);
roomRouter.get("/getOne/:roomId", getRoomById);
roomRouter.delete("/delete/:roomId", deleteRoom);

module.exports = roomRouter;
