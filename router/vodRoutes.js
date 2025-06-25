const express = require("express");
const router = express.Router();
const vodController = require("../controllers/vodController");

router.route("/play").post(vodController.getVodStreamLink);
router.route("/categories").post(vodController.getCategories);
router
  .route("/categories/:id")
  .post(
    vodController.getCategoriesItem,
    vodController.getCategoriesItemSeasonsAndEpisodeLink
  );
router.route("/search").post(vodController.getVodBySearch);

router.route("/proxy/master.m3u8").get((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
}, vodController.proxyHttpStream);
router.route("/proxy/segment").get((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
}, vodController.proxySegment);
module.exports = router;
