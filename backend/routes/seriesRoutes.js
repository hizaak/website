const express = require("express");
const router = express.Router();

const serieController = require("../controllers/serieController");

router.post("/", serieController.create);
router.get("/", serieController.getAll);
router.get("/:id", serieController.get);
router.put("/:id", serieController.update);
router.delete("/:id", serieController.delete);

module.exports = router;
