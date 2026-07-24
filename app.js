const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config({ path: `./dotenv.config` });
const liveRouter = require("./router/liveRoutes");
const vodRouter = require("./router/vodRoutes");
const authController = require("./controllers/authController");
const app = express();
app.set("trust proxy", true);
app.use(morgan("dev"));
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

// serve frontend as static
app.use(
  express.static(path.join(__dirname, "frontend/dist"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("sw.js")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// generate token and get profile details to activate the token machanism
app.use("/authenticate", authController.performHandshake);

// get profile details
app.use("/profile", authController.getProfileDetails);

//live route
app.use("/live", liveRouter);

//vod route
app.use("/vod", vodRouter);

app.get("*", (req, res) => {
  if (
    req.path.endsWith(".js") ||
    req.path.endsWith(".css") ||
    req.path.endsWith(".json") ||
    req.path.endsWith(".webmanifest")
  ) {
    return res.status(404).send("File not found");
  }
  res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});
module.exports = app;
