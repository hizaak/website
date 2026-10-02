const express = require("express");
const router = express.Router();

const homePageController = require("../../controllers/pages/home");

router.get("/", homePageController.get);

module.exports = router;
