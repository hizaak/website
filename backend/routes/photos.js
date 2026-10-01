const express = require("express");

const photoController = require("../controllers/photo");
const { verifyToken } = require("../config/authMiddleware");
const {
  validateRequest,
  photoSchema,
  photoUpdateSchema,
  photoReorderSchema,
} = require("../config/validation");
const { uploadSingleImage, processUploadedImage } = require("../config/upload");

// Nested under /api/works/:workId/photos
const nested = express.Router({ mergeParams: true });

nested.get("/", photoController.getByWorkId);
nested.post(
  "/",
  verifyToken,
  uploadSingleImage("photo"),
  validateRequest(photoSchema),
  processUploadedImage,
  photoController.create
);
nested.put(
  "/reorder",
  verifyToken,
  validateRequest(photoReorderSchema),
  photoController.reorder
);

// Flat collection under /api/photos
const collection = express.Router();

collection.get("/:id", photoController.get);
collection.get("/:id/original", verifyToken, photoController.downloadOriginal);
collection.put(
  "/:id",
  verifyToken,
  uploadSingleImage("photo"),
  validateRequest(photoUpdateSchema),
  processUploadedImage,
  photoController.update
);
collection.delete("/:id", verifyToken, photoController.delete);

module.exports = { nested, collection };
