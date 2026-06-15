const express = require("express");
const router = express.Router();

const photoController = require("../controllers/photoController");
const { verifyToken } = require("../config/authMiddleware");
const { validateRequest, photoUpdateSchema } = require("../config/validation");
const { upload } = require("../config/upload");

const handleMulterUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.get("/:id", photoController.get);
router.put(
  "/:id",
  verifyToken,
  handleMulterUpload("photo"),
  validateRequest(photoUpdateSchema),
  photoController.update
);
router.delete("/:id", verifyToken, photoController.delete);

module.exports = router;
