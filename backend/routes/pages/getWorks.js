const express = require("express");
const router = express.Router();

const worksPageController = require("../../controllers/pages/getWorks");

router.get(
  "/",
  worksPageController.getWorksPage
);

module.exports = router;