const express = require("express");
const router = express.Router();
const liveController = require("../controllers/liveController");

router.route("/play").post(liveController.getLiveStream);
router.route("/categories").post(liveController.getCategories);
router.route("/categories/:id").post(liveController.getCategoriesChannel);

module.exports = router;
