const express = require("express");
const router = express.Router();

const workPageController = require("../../controllers/pages/work");

router.get("/:id", workPageController.get);

module.exports = router;
