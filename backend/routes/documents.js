const express = require("express");

const documentController = require("../controllers/document");
const { verifyToken } = require("../config/authMiddleware");
const {
  validateRequest,
  documentSchema,
  documentRenameSchema,
} = require("../config/validation");
const { uploadSingleDocument } = require("../config/upload");

// Admin API under /api/documents
const api = express.Router();

api.get("/", verifyToken, documentController.getAll);
api.post(
  "/",
  verifyToken,
  uploadSingleDocument("document"),
  validateRequest(documentSchema),
  documentController.create
);
api.put(
  "/:filename",
  verifyToken,
  validateRequest(documentRenameSchema),
  documentController.rename
);
api.delete("/:filename", verifyToken, documentController.delete);

// Public raw files under /documents
const files = express.Router();

files.get("/:name", documentController.serve);

module.exports = { api, files };
