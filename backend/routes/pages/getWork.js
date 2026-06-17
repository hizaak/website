const express = require("express");
const router = express.Router();

const workController = require(
  "../../controllers/pages/getWork"
);

router.get(
  "/:id",
  workController.getWork
);

module.exports = router;