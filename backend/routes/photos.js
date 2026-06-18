const express = require("express");
const router = express.Router();

const photoController = require("../controllers/photo");
const { verifyToken } = require("../config/authMiddleware");
const { validateRequest, photoUpdateSchema } = require("../config/validation");
const { uploadSingleImage } = require("../config/upload");

router.get("/:id", photoController.get);
router.put(
  "/:id",
  verifyToken,
  uploadSingleImage("photo"),
  validateRequest(photoUpdateSchema),
  photoController.update
);
router.delete("/:id", verifyToken, photoController.delete);

module.exports = router;
