const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config({ path: `./dotenv.config` });
const liveRouter = require("./router/liveRoutes");
const vodRouter = require("./router/vodRoutes");
const meRouter = require("./router/meRoutes");
const authController = require("./controllers/authController");
const viewerMiddleware = require("./controllers/viewerMiddleware");
const app = express();
app.use(morgan("dev"));
app.use(express.json());

app.use(
  cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization", "X-Viewer-Key"],
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

// anonymous viewer persistence (watch progress + playback events)
app.use("/me", viewerMiddleware, meRouter);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});
module.exports = app;
