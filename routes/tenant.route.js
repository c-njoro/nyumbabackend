const express = require("express");
const tenantRouter = express.Router();

const {
  createTenantWithNoRoom,
  createTenantWithRoom,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
} = require("../controllers/tenant.controller");

//tenant routes
tenantRouter.post("/create-with-no-room", createTenantWithNoRoom);
tenantRouter.post("/create", createTenantWithRoom);
tenantRouter.get("/", getAllTenants);
tenantRouter.get("/get-one/:tenantId", getTenantById);
tenantRouter.put("/update/:tenantId", updateTenant);
tenantRouter.delete("/delete/:tenantId", deleteTenant);

module.exports = tenantRouter;
