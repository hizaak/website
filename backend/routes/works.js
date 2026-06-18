const express = require("express");
const router = express.Router();

const workController = require("../controllers/work");
const photoController = require("../controllers/photo");
const { verifyToken } = require("../config/authMiddleware");
const {
  validateRequest,
  workSchema,
  workUpdateSchema,
  photoSchema,
  photoReorderSchema,
} = require("../config/validation");
const { uploadSingleImage } = require("../config/upload");

router.get("/", workController.getAll);
router.post("/", verifyToken, validateRequest(workSchema), workController.create);
router.get("/:workId/photos", photoController.getByWorkId);
router.put(
  "/:workId/photos/reorder",
  verifyToken,
  validateRequest(photoReorderSchema),
  workController.reorderPhotos
);
router.post(
  "/:workId/photos",
  verifyToken,
  uploadSingleImage("photo"),
  validateRequest(photoSchema),
  photoController.create
);
router.get("/:id", workController.get);
router.put("/:id", verifyToken, validateRequest(workUpdateSchema), workController.update);
router.delete("/:id", verifyToken, workController.delete);

module.exports = router;
