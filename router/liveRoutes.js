const express = require("express");
const router = express.Router();
const liveController = require("../controllers/liveController");

router.route("/play").post(liveController.getLiveStream);
router.route("/categories").post(liveController.getCategories);
router.route("/categories/:id").post(liveController.getCategoriesChannel);

// Proxy routes for live streaming
const setCorsHeaders = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
};

router.route("/proxy/master.m3u8").get(setCorsHeaders, liveController.proxyMasterPlaylist);
router.route("/proxy/track.m3u8").get(setCorsHeaders, liveController.proxyTrackPlaylist);
router.route("/proxy/segment").get(setCorsHeaders, liveController.proxySegment);

module.exports = router;
