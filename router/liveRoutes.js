const express = require("express");
const router = express.Router();
const liveController = require("../controllers/liveController");

router.route("/play").post(liveController.getLiveStream);
router.route("/categories").post(liveController.getCategories);
router.route("/categories/:id").post(liveController.getCategoriesChannel);

// Proxy routes for live streaming
router.route("/proxy/master.m3u8").get((req, res, next) => {
  [
    "x-forwarded-for",
    "x-forwarded-host",
    "x-forwarded-proto",
    "x-railway-edge",
    "x-railway-request-id",
    "x-real-ip",
    "x-request-start",
  ].forEach((header) => res.removeHeader(header));
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
}, liveController.proxyMasterPlaylist);

router.route("/proxy/track.m3u8").get((req, res, next) => {
  [
    "x-forwarded-for",
    "x-forwarded-host",
    "x-forwarded-proto",
    "x-railway-edge",
    "x-railway-request-id",
    "x-real-ip",
    "x-request-start",
  ].forEach((header) => res.removeHeader(header));
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
}, liveController.proxyTrackPlaylist);

router.route("/proxy/segment").get((req, res, next) => {
  [
    "x-forwarded-for",
    "x-forwarded-host",
    "x-forwarded-proto",
    "x-railway-edge",
    "x-railway-request-id",
    "x-real-ip",
    "x-request-start",
  ].forEach((header) => res.removeHeader(header));
  res.header("Access-Control-Allow-Origin", "*");
  next();
}, liveController.proxySegment);

module.exports = router;
