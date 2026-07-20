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

const setCorsHeaders = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
};

router.route("/proxy/master.m3u8").get(setCorsHeaders, vodController.proxyHttpStream);
router.route("/proxy/segment").get(setCorsHeaders, vodController.proxySegment);
module.exports = router;
