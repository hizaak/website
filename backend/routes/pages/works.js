const express = require("express");
const router = express.Router();

const worksPageController = require("../../controllers/pages/works");

router.get("/", worksPageController.getAll);

module.exports = router;
