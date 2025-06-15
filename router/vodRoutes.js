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
module.exports = router;
