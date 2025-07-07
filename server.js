const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  cors({
    exposedHeaders: ["Content-Range"],
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

// Importing routes
const landlordRouter = require("./routes/landlord.route");
const tenantRouter = require("./routes/tenant.route");
const roomRouter = require("./routes/room.route");
const propertyRouter = require("./routes/property.route");

// Using routes
app.use("/api/landlord", landlordRouter);
app.use("/api/tenant", tenantRouter);
app.use("/api/room", roomRouter);
app.use("/api/property", propertyRouter);

// MongoDB connection
mongoose
  .connect(process.env.LOCAL_KEY, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    // Start the server after successful connection
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on PORT:: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
