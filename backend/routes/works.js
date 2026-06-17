const express = require("express");
const router = express.Router();

const workController = require("../controllers/work");
const photoController = require("../controllers/photo");
const { verifyToken } = require("../config/authMiddleware");
const { validateRequest, workSchema, workUpdateSchema, photoSchema } = require("../config/validation");
const { upload } = require("../config/upload");

const handleMulterUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.get("/", workController.getAll);
router.post("/", verifyToken, validateRequest(workSchema), workController.create);
router.get("/:workId/photos", photoController.getByWorkId);
router.post(
  "/:workId/photos",
  verifyToken,
  handleMulterUpload("photo"),
  validateRequest(photoSchema),
  photoController.create
);
router.get("/:id", workController.get);
router.put("/:id", verifyToken, validateRequest(workUpdateSchema), workController.update);
router.delete("/:id", verifyToken, workController.delete);

module.exports = router;
