const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config({ path: `./dotenv.config` });
const liveRouter = require("./router/liveRoutes");
const vodRouter = require("./router/vodRoutes");
const authController = require("./controllers/authController");
const app = express();
app.use(morgan("dev"));
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

// serve frontend as static

app.use(express.static(path.join(__dirname, "frontend/dist")));

// generate token and get profile details to activate the token machanism
app.use("/authenticate", authController.performHandshake);

// get profile details
app.use("/profile", authController.getProfileDetails);

//live route
app.use("/live", liveRouter);

//vod route
app.use("/vod", vodRouter);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});
module.exports = app;
