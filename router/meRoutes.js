const express = require("express");
const router = express.Router();
const meController = require("../controllers/meController");

router.route("/playback").post(meController.postPlayback);
router.route("/progress").get(meController.getProgress);
router.route("/continue").get(meController.getContinueWatching);
router.route("/history").get(meController.getHistory);

module.exports = router;
